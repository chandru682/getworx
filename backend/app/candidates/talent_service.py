import re
import math
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any

from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User, UserRole
from app.candidates.models import CandidateProfile, SavedCandidate, CandidateUnlock
from app.candidates.schemas import (
    CandidateTalentCardResponse,
    CandidateMatchTag,
    JobDescriptionMatchRequest,
    ParsedJDInfo,
    TalentSearchFilterRequest,
    TalentSearchPaginatedResponse,
)
from app.subscriptions.service import SubscriptionService
from app.core.errors import NotFoundException, ForbiddenException, BadRequestException


TECH_SKILL_LEXICON = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "MySQL", "PostgreSQL",
    "MongoDB", "AWS", "Docker", "Kubernetes", "Figma", "UI/UX", "Java", "C++", "C#", "Git",
    "REST API", "GraphQL", "CI/CD", "Redis", "Tailwind CSS", "HTML5/CSS3", "Angular", "Vue.js",
    "Django", "FastAPI", "Spring Boot", "Flutter", "React Native", "Machine Learning", "AI",
    "Data Analysis", "Selenium", "Jira", "Excel", "Sales", "Marketing", "HR", "Recruitment"
]


class BooleanQueryParser:
    """Parses boolean queries like: Java AND ("Spring Boot" OR Microservices) NOT Fresher"""
    
    @staticmethod
    def tokenize(query_str: str) -> List[str]:
        token_specification = [
            ('QUOTE',    r'"[^"]*"'),
            ('LPAREN',   r'\('),
            ('RPAREN',   r'\)'),
            ('OPERATOR', r'\b(?:AND|OR|NOT)\b'),
            ('WORD',     r'[^\s()"]+'),
            ('SKIP',     r'\s+'),
        ]
        tok_regex = '|'.join('(?P<%s>%s)' % pair for pair in token_specification)
        tokens = []
        for mo in re.finditer(tok_regex, query_str, re.IGNORECASE):
            kind = mo.lastgroup
            value = mo.group()
            if kind == 'SKIP':
                continue
            elif kind == 'QUOTE':
                tokens.append(value[1:-1])
            elif kind == 'OPERATOR':
                tokens.append(value.upper())
            else:
                tokens.append(value)
        return tokens

    @staticmethod
    def parse_to_rpn(tokens: List[str]) -> List[str]:
        precedence = {'NOT': 3, 'AND': 2, 'OR': 1}
        output = []
        operators = []
        
        infix_tokens = []
        for i, tok in enumerate(tokens):
            if i > 0:
                prev = tokens[i - 1]
                prev_is_term = prev not in ('AND', 'OR', 'NOT', '(')
                curr_is_term = tok not in ('AND', 'OR', ')')
                if prev_is_term and curr_is_term:
                    infix_tokens.append('AND')
            infix_tokens.append(tok)

        for token in infix_tokens:
            if token == '(':
                operators.append(token)
            elif token == ')':
                while operators and operators[-1] != '(':
                    output.append(operators.pop())
                if operators and operators[-1] == '(':
                    operators.pop()
            elif token in precedence:
                while operators and operators[-1] in precedence and precedence[operators[-1]] >= precedence[token]:
                    output.append(operators.pop())
                operators.append(token)
            else:
                output.append(token)
                
        while operators:
            output.append(operators.pop())
            
        return output

    @classmethod
    def evaluate(cls, rpn_tokens: List[str], text_content: str) -> bool:
        if not rpn_tokens:
            return True
            
        text_lower = text_content.lower()
        stack = []
        
        for token in rpn_tokens:
            if token == 'NOT':
                if not stack:
                    return False
                val = stack.pop()
                stack.append(not val)
            elif token == 'AND':
                if len(stack) < 2:
                    return False
                val2 = stack.pop()
                val1 = stack.pop()
                stack.append(val1 and val2)
            elif token == 'OR':
                if len(stack) < 2:
                    return False
                val2 = stack.pop()
                val1 = stack.pop()
                stack.append(val1 or val2)
            else:
                stack.append(token.lower() in text_lower)
                
        return stack[0] if stack else False


class TalentSearchService:
    """Service handling verified global candidate search, AI JD matching, candidate saving, and profile unlocks."""

    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _parse_experience_years(exp_str: Optional[str]) -> float:
        if not exp_str:
            return 0.0
        match = re.search(r'(\d+(?:\.\d+)?)', str(exp_str))
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return 0.0
        return 0.0

    @staticmethod
    def _mask_name(name: str) -> str:
        parts = name.strip().split()
        if len(parts) == 1:
            return f"{parts[0][:2]}***" if len(parts[0]) > 2 else f"{parts[0]}***"
        return f"{parts[0]} {parts[-1][0]}***"

    @staticmethod
    def _mask_email(email: str) -> str:
        if not email or "@" not in email:
            return "c***@candidate.com"
        user_part, domain = email.split("@", 1)
        masked_user = f"{user_part[:2]}***{user_part[-1]}" if len(user_part) > 2 else f"{user_part[:1]}***"
        return f"{masked_user}@{domain}"

    @staticmethod
    def _mask_phone(phone: Optional[str]) -> str:
        if not phone:
            return "+91 ***** ****"
        clean = str(phone).strip()
        if len(clean) > 4:
            return f"{clean[:3]} ***** {clean[-2:]}"
        return "+91 ***** ****"

    async def _get_company_unlock_stats(self, company_id: Optional[int]) -> Tuple[int, int]:
        """Return (remaining_count, limit_count) for the company's active subscription."""
        if not company_id:
            return 500, 500

        sub_service = SubscriptionService(self.session)
        sub = await sub_service.repo.get_company_subscription(company_id)
        limit = 500
        if sub and sub.plan:
            limit = sub.plan.resume_views_limit if sub.plan.resume_views_limit != -1 else 10000

        cnt_stmt = select(func.count(CandidateUnlock.id)).where(CandidateUnlock.company_id == company_id)
        unlocked_cnt = (await self.session.execute(cnt_stmt)).scalar() or 0
        remaining = max(0, limit - unlocked_cnt)
        return remaining, limit

    async def _get_company_saved_ids(self, company_id: Optional[int], user_id: int) -> set:
        stmt = select(SavedCandidate.candidate_profile_id).where(
            or_(SavedCandidate.company_id == company_id, SavedCandidate.user_id == user_id)
        )
        res = await self.session.execute(stmt)
        return set(res.scalars().all())

    async def _get_company_unlocked_ids(self, company_id: Optional[int], user_id: int) -> set:
        stmt = select(CandidateUnlock.candidate_profile_id).where(
            or_(CandidateUnlock.company_id == company_id, CandidateUnlock.user_id == user_id)
        )
        res = await self.session.execute(stmt)
        return set(res.scalars().all())

    def _build_candidate_card(
        self,
        candidate: CandidateProfile,
        user: User,
        saved_set: set,
        unlocked_set: set,
        score: float = 0.0,
        tags: List[CandidateMatchTag] = None,
        boolean_match_keywords: List[str] = None,
    ) -> CandidateTalentCardResponse:
        is_saved = candidate.id in saved_set
        is_unlocked = candidate.id in unlocked_set
        exp_years = self._parse_experience_years(candidate.total_experience)
        skills = candidate.skills_json if isinstance(candidate.skills_json, list) else []

        loc_parts = [p for p in [candidate.city, candidate.state, candidate.country] if p]
        location_display = ", ".join(loc_parts) if loc_parts else (candidate.preferred_location or "India")

        return CandidateTalentCardResponse(
            id=candidate.id,
            user_id=candidate.user_id,
            name=candidate.name if is_unlocked else self._mask_name(candidate.name),
            masked_name=self._mask_name(candidate.name),
            email=user.email if is_unlocked else None,
            phone=candidate.phone if is_unlocked else None,
            masked_email=self._mask_email(user.email),
            masked_phone=self._mask_phone(candidate.phone),
            photo_url=candidate.photo_url,
            current_role=candidate.current_role or candidate.preferred_job_role or "Software Professional",
            total_experience=candidate.total_experience or "0 years",
            experience_years=exp_years,
            city=candidate.city,
            state=candidate.state,
            country=candidate.country,
            location_display=location_display,
            expected_salary=candidate.expected_salary or "Not Specified",
            highest_qualification=candidate.highest_qualification or "Bachelor's Degree",
            university=candidate.university,
            graduation_year=candidate.graduation_year,
            notice_period=candidate.notice_period or "30 Days",
            skills=skills,
            has_resume=bool(candidate.resume_url),
            resume_url=candidate.resume_url if is_unlocked else None,
            linkedin_url=candidate.linkedin_url if is_unlocked else None,
            portfolio_url=candidate.portfolio_url if is_unlocked else None,
            ai_match_score=round(score, 1),
            match_tags=tags or [],
            is_saved=is_saved,
            is_unlocked=is_unlocked,
            profile_completion_percentage=candidate.profile_completion_percentage or 85,
            boolean_match_keywords=boolean_match_keywords or [],
        )

    async def search_talent(
        self,
        request: TalentSearchFilterRequest,
        company_id: Optional[int],
        user_id: int,
    ) -> TalentSearchPaginatedResponse:
        """Search verified candidates in MySQL with multi-criteria filters and in-memory boolean parser."""
        stmt = (
            select(CandidateProfile, User)
            .join(User, CandidateProfile.user_id == User.id)
            .where(User.deleted_at.is_(None))
        )

        # Filters (non-query database filters)
        if request.role:
            r = f"%{request.role.strip()}%"
            stmt = stmt.where(
                or_(
                    CandidateProfile.current_role.ilike(r),
                    CandidateProfile.preferred_job_role.ilike(r),
                )
            )

        if request.location:
            loc = f"%{request.location.strip()}%"
            stmt = stmt.where(
                or_(
                    CandidateProfile.city.ilike(loc),
                    CandidateProfile.state.ilike(loc),
                    CandidateProfile.country.ilike(loc),
                    CandidateProfile.preferred_location.ilike(loc),
                )
            )

        if request.education:
            edu = f"%{request.education.strip()}%"
            stmt = stmt.where(
                or_(
                    CandidateProfile.highest_qualification.ilike(edu),
                    CandidateProfile.university.ilike(edu),
                )
            )

        if request.notice_period:
            np = f"%{request.notice_period.strip()}%"
            stmt = stmt.where(CandidateProfile.notice_period.ilike(np))

        # Sort by completion but get all matching rows for post-filtering
        stmt = stmt.order_by(CandidateProfile.profile_completion_percentage.desc(), CandidateProfile.id.desc())
        results = (await self.session.execute(stmt)).all()

        saved_set = await self._get_company_saved_ids(company_id, user_id)
        unlocked_set = await self._get_company_unlocked_ids(company_id, user_id)
        rem_unlocks, limit_unlocks = await self._get_company_unlock_stats(company_id)

        # Boolean Query Setup
        rpn_tokens = None
        query_tokens = None
        if request.query:
            query_tokens = BooleanQueryParser.tokenize(request.query)
            rpn_tokens = BooleanQueryParser.parse_to_rpn(query_tokens)

        items = []
        for cand, usr in results:
            skills_list = cand.skills_json if isinstance(cand.skills_json, list) else []
            loc_parts = [p for p in [cand.city, cand.state, cand.country] if p]
            location_display = ", ".join(loc_parts) if loc_parts else (cand.preferred_location or "India")

            # Post-filter skills if provided
            if request.skills:
                req_skills_lower = [s.lower() for s in request.skills]
                cand_skills_lower = [s.lower() for s in skills_list]
                if not any(req in " ".join(cand_skills_lower) for req in req_skills_lower):
                    continue

            # Post-filter experience years if provided
            exp_yrs = self._parse_experience_years(cand.total_experience)
            if request.min_experience is not None and exp_yrs < request.min_experience:
                continue
            if request.max_experience is not None and exp_yrs > request.max_experience:
                continue

            # Construct Candidate Profile Text for query matching
            cert_str = " ".join(cand.certifications_json or []) if isinstance(cand.certifications_json, list) else ""
            lang_str = " ".join(cand.languages_json or []) if isinstance(cand.languages_json, list) else ""
            cand_text = f"{cand.name} {cand.current_role or ''} {cand.preferred_job_role or ''} {cand.total_experience or ''} {cand.preferred_location or ''} {cand.highest_qualification or ''} {cand.university or ''} {' '.join(skills_list)} {cert_str} {lang_str} {usr.email}"

            # Boolean Search Parser
            matched_words = []
            if rpn_tokens:
                if not BooleanQueryParser.evaluate(rpn_tokens, cand_text):
                    continue
                # Extract matched keywords for highlights
                unique_terms = set(t for t in query_tokens if t not in ('AND', 'OR', 'NOT', '(', ')'))
                cand_text_lower = cand_text.lower()
                for term in unique_terms:
                    if term.lower() in cand_text_lower:
                        matched_words.append(term)

            # Calculate match score and tags dynamically
            score = 75.0 + (cand.profile_completion_percentage or 85) * 0.1
            match_tags = []

            # 1. Role Score adjustment
            if request.role:
                cand_role = (cand.current_role or cand.preferred_job_role or "").lower()
                req_role = request.role.lower()
                if req_role in cand_role or cand_role in req_role:
                    score += 8.0
                    match_tags.append(CandidateMatchTag(label="Role Match", type="role"))
                else:
                    score -= 5.0

            # 2. Experience Score adjustment
            if request.min_experience is not None:
                if exp_yrs >= request.min_experience:
                    score += 5.0
                    match_tags.append(CandidateMatchTag(label="Exp Requirements Met", type="exp"))
                else:
                    diff = request.min_experience - exp_yrs
                    score -= min(15.0, diff * 3.0)

            # 3. Location Score adjustment
            if request.location:
                cand_loc = (location_display).lower()
                req_loc = request.location.lower()
                if req_loc in cand_loc or cand_loc in req_loc:
                    score += 5.0
                    match_tags.append(CandidateMatchTag(label="Location Match", type="loc"))
                else:
                    score -= 3.0

            # 4. Skills Score adjustment
            if request.skills:
                req_skills_lower = [s.lower() for s in request.skills]
                cand_skills_lower = [s.lower() for s in skills_list]
                matched_cnt = sum(1 for req_sk in req_skills_lower if any(req_sk in cs for cs in cand_skills_lower))
                total_req = len(req_skills_lower)
                ratio = matched_cnt / max(1, total_req)
                score += (ratio - 0.5) * 20.0
                if matched_cnt > 0:
                    match_tags.append(CandidateMatchTag(label=f"{matched_cnt}/{total_req} Skills Matched", type="skill"))

            # 5. Query Search adjustment (boost for Boolean keyword matches)
            if matched_words:
                score += min(15.0, len(matched_words) * 3.0)
                match_tags.append(CandidateMatchTag(label=f"{len(matched_words)} Query Keywords Matched", type="skill"))

            final_score = min(99.0, max(50.0, score))

            card = self._build_candidate_card(
                cand, usr, saved_set, unlocked_set, 
                score=final_score, tags=match_tags,
                boolean_match_keywords=matched_words
            )
            items.append(card)

        # Sort items by AI Match Score descending
        items.sort(key=lambda x: x.ai_match_score, reverse=True)

        # Pagination slicing in Python memory
        total = len(items)
        offset = (request.page - 1) * request.limit
        paged_items = items[offset : offset + request.limit]
        pages = math.ceil(total / request.limit) if total > 0 else 1

        return TalentSearchPaginatedResponse(
            items=paged_items,
            total=total,
            page=request.page,
            pages=pages,
            limit=request.limit,
            remaining_unlocks=rem_unlocks,
            total_unlock_limit=limit_unlocks,
        )

    def extract_jd_criteria(self, jd_text: str) -> ParsedJDInfo:
        """Extract title, skills, min experience from raw JD text."""
        text_upper = jd_text.upper()
        text_lower = jd_text.lower()

        # Extract Title
        extracted_title = "Software Engineer"
        title_candidates = [
            "Full Stack Developer", "Frontend Developer", "Backend Developer", "Software Engineer",
            "Python Developer", "React Developer", "UI/UX Designer", "DevOps Engineer",
            "QA Engineer", "Data Analyst", "Product Manager", "HR Executive", "Sales Representative"
        ]
        for tc in title_candidates:
            if tc.lower() in text_lower:
                extracted_title = tc
                break

        # Extract Skills
        extracted_skills = []
        for lex in TECH_SKILL_LEXICON:
            if lex.lower() in text_lower:
                extracted_skills.append(lex)

        if not extracted_skills:
            extracted_skills = ["Python", "JavaScript", "SQL", "React"]

        # Extract Min Experience
        min_exp = 2
        exp_match = re.search(r'(\d+)\s*\+?\s*(?:years|yrs)', text_lower)
        if exp_match:
            try:
                min_exp = int(exp_match.group(1))
            except ValueError:
                min_exp = 2

        return ParsedJDInfo(
            extracted_title=extracted_title,
            extracted_skills=extracted_skills[:8],
            extracted_min_experience=min_exp,
            extracted_location="India",
        )

    async def match_candidates_by_jd(
        self,
        request: JobDescriptionMatchRequest,
        company_id: Optional[int],
        user_id: int,
    ) -> TalentSearchPaginatedResponse:
        """Parse Job Description, calculate AI Match Scores, and rank candidates."""
        parsed_jd = self.extract_jd_criteria(request.jd_text)

        stmt = (
            select(CandidateProfile, User)
            .join(User, CandidateProfile.user_id == User.id)
            .where(User.deleted_at.is_(None))
        )
        all_results = (await self.session.execute(stmt)).all()

        saved_set = await self._get_company_saved_ids(company_id, user_id)
        unlocked_set = await self._get_company_unlocked_ids(company_id, user_id)
        rem_unlocks, limit_unlocks = await self._get_company_unlock_stats(company_id)

        scored_candidates = []
        for cand, usr in all_results:
            cand_skills = set(s.lower() for s in (cand.skills_json if isinstance(cand.skills_json, list) else []))
            req_skills = set(s.lower() for s in parsed_jd.extracted_skills)

            matched_skills = cand_skills.intersection(req_skills)
            skill_ratio = (len(matched_skills) / max(1, len(req_skills))) if req_skills else 0.5
            skill_score = skill_ratio * 45.0

            # Role Match Score (30%)
            cand_role = (cand.current_role or cand.preferred_job_role or "").lower()
            role_score = 30.0 if parsed_jd.extracted_title.lower() in cand_role or cand_role in parsed_jd.extracted_title.lower() else 15.0

            # Experience Score (15%)
            cand_exp = self._parse_experience_years(cand.total_experience)
            exp_score = 15.0 if cand_exp >= parsed_jd.extracted_min_experience else (cand_exp / max(1, parsed_jd.extracted_min_experience)) * 15.0

            # Baseline Profile Completion Score (10%)
            completion_score = (cand.profile_completion_percentage / 100.0) * 10.0

            total_score = min(99.0, max(50.0, skill_score + role_score + exp_score + completion_score))

            # Build Match Tags
            match_tags = []
            if matched_skills:
                match_tags.append(CandidateMatchTag(label=f"{len(matched_skills)}/{len(req_skills)} Skills Matched", type="skill"))
            if cand_exp >= parsed_jd.extracted_min_experience:
                match_tags.append(CandidateMatchTag(label=f"{int(cand_exp)} Yrs Exp Meets Requirement", type="exp"))
            if role_score >= 25.0:
                match_tags.append(CandidateMatchTag(label="Role Title Match", type="role"))

            card = self._build_candidate_card(cand, usr, saved_set, unlocked_set, score=total_score, tags=match_tags)
            scored_candidates.append(card)

        # Rank descending by score
        scored_candidates.sort(key=lambda x: x.ai_match_score, reverse=True)

        total = len(scored_candidates)
        offset = (request.page - 1) * request.limit
        paged_items = scored_candidates[offset : offset + request.limit]
        pages = math.ceil(total / request.limit) if total > 0 else 1

        return TalentSearchPaginatedResponse(
            items=paged_items,
            total=total,
            page=request.page,
            pages=pages,
            limit=request.limit,
            remaining_unlocks=rem_unlocks,
            total_unlock_limit=limit_unlocks,
            parsed_jd=parsed_jd,
        )

    async def save_candidate(self, candidate_id: int, company_id: Optional[int], user_id: int, notes: Optional[str] = None) -> bool:
        stmt = select(SavedCandidate).where(
            SavedCandidate.candidate_profile_id == candidate_id,
            or_(SavedCandidate.company_id == company_id, SavedCandidate.user_id == user_id),
        )
        existing = (await self.session.execute(stmt)).scalar_one_or_none()
        if existing:
            return True

        rec = SavedCandidate(company_id=company_id, user_id=user_id, candidate_profile_id=candidate_id, notes=notes)
        self.session.add(rec)
        await self.session.commit()
        return True

    async def unsave_candidate(self, candidate_id: int, company_id: Optional[int], user_id: int) -> bool:
        stmt = select(SavedCandidate).where(
            SavedCandidate.candidate_profile_id == candidate_id,
            or_(SavedCandidate.company_id == company_id, SavedCandidate.user_id == user_id),
        )
        existing = (await self.session.execute(stmt)).scalar_one_or_none()
        if existing:
            await self.session.delete(existing)
            await self.session.commit()
        return True

    async def list_saved_candidates(self, company_id: Optional[int], user_id: int) -> List[CandidateTalentCardResponse]:
        stmt = (
            select(CandidateProfile, User)
            .join(User, CandidateProfile.user_id == User.id)
            .join(SavedCandidate, SavedCandidate.candidate_profile_id == CandidateProfile.id)
            .where(or_(SavedCandidate.company_id == company_id, SavedCandidate.user_id == user_id))
        )
        results = (await self.session.execute(stmt)).all()
        saved_set = await self._get_company_saved_ids(company_id, user_id)
        unlocked_set = await self._get_company_unlocked_ids(company_id, user_id)

        items = []
        for cand, usr in results:
            card = self._build_candidate_card(cand, usr, saved_set, unlocked_set, score=90.0)
            items.append(card)
        return items

    async def unlock_candidate_profile(self, candidate_id: int, company_id: Optional[int], user_id: int) -> CandidateTalentCardResponse:
        cand_stmt = select(CandidateProfile, User).join(User, CandidateProfile.user_id == User.id).where(CandidateProfile.id == candidate_id)
        res = (await self.session.execute(cand_stmt)).first()
        if not res:
            raise NotFoundException(f"Candidate profile ID '{candidate_id}' not found.")
        cand, usr = res

        rem_unlocks, _ = await self._get_company_unlock_stats(company_id)
        if rem_unlocks <= 0:
            raise ForbiddenException("You have reached your company's profile unlock limit. Please upgrade your subscription.")

        # Check existing unlock
        unlocked_set = await self._get_company_unlocked_ids(company_id, user_id)
        if candidate_id not in unlocked_set:
            rec = CandidateUnlock(company_id=company_id, user_id=user_id, candidate_profile_id=candidate_id, unlocked_at=datetime.now(timezone.utc))
            self.session.add(rec)
            await self.session.commit()
            unlocked_set.add(candidate_id)

        saved_set = await self._get_company_saved_ids(company_id, user_id)
        return self._build_candidate_card(cand, usr, saved_set, unlocked_set, score=95.0)
