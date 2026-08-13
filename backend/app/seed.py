"""
Seed script — populates the database with 5 realistic, full-duration demo meetings.

Usage (from backend/):
    python -m app.seed

Idempotent: checks for existing meetings by title before inserting.
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.models import (  # ensures all models are registered with Base  # noqa: F401
    ActionItem,
    Meeting,
    MeetingParticipant,
    Participant,
    Summary,
    Topic,
    TranscriptSegment,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _utc(year: int, month: int, day: int, hour: int = 10, minute: int = 0) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=timezone.utc)


def _due(days_from_now: int) -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=days_from_now)


def _get_or_create_participant(db: Session, name: str, email: str, avatar_url: str | None = None) -> Participant:
    p = db.query(Participant).filter(Participant.email == email).first()
    if not p:
        p = Participant(name=name, email=email, avatar_url=avatar_url, created_at=datetime.now(timezone.utc))
        db.add(p)
        db.flush()
    return p


def _add_participants(db: Session, meeting: Meeting, participants: list[Participant]) -> None:
    existing_ids = {mp.participant_id for mp in db.query(MeetingParticipant).filter(MeetingParticipant.meeting_id == meeting.id).all()}
    for p in participants:
        if p.id not in existing_ids:
            db.add(MeetingParticipant(meeting_id=meeting.id, participant_id=p.id))


def _extend_transcript(
    db: Session,
    meeting: Meeting,
    dialogue_turns: list[tuple[Participant, str]],
    start_seq: int,
    start_time: float,
) -> None:
    target_duration = float(meeting.duration_seconds or 0)
    current_seq = start_seq
    current_start = start_time

    turn_index = 0
    num_turns = len(dialogue_turns)

    while current_start < target_duration - 2.0:
        speaker, text = dialogue_turns[turn_index % num_turns]
        turn_index += 1

        words = len(text.split())
        seg_duration = max(15.0, min(32.0, words * 0.45))
        current_end = current_start + seg_duration

        if current_end >= target_duration - 3.0:
            current_end = target_duration

        db.add(TranscriptSegment(
            meeting_id=meeting.id,
            participant_id=speaker.id,
            start_time=round(current_start, 1),
            end_time=round(current_end, 1),
            text=text,
            sequence=current_seq,
        ))

        current_seq += 1
        if current_end >= target_duration:
            break
        current_start = round(current_end + 1.0, 1)


# ---------------------------------------------------------------------------
# Meeting 1 — Q3 Product Strategy Review
# ---------------------------------------------------------------------------

def seed_product_strategy(db: Session) -> None:
    title = "Q3 Product Strategy Review"
    if db.query(Meeting).filter(Meeting.title == title).first():
        print(f"  [skip] {title}")
        return

    now = datetime.now(timezone.utc)
    meeting = Meeting(
        title=title,
        description="Quarterly review of product vision, roadmap priorities, and OKR alignment for Q3.",
        meeting_date=_utc(2026, 7, 14, 14, 0),
        duration_seconds=3720,
        created_at=now,
        updated_at=now,
    )
    db.add(meeting)
    db.flush()

    sarah = _get_or_create_participant(db, "Sarah Chen", "sarah.chen@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah")
    marcus = _get_or_create_participant(db, "Marcus Williams", "marcus.williams@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus")
    priya = _get_or_create_participant(db, "Priya Patel", "priya.patel@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=priya")
    jordan = _get_or_create_participant(db, "Jordan Lee", "jordan.lee@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan")

    _add_participants(db, meeting, [sarah, marcus, priya, jordan])

    initial_segments = [
        (1,  sarah,  0.0,   14.5,  "Good afternoon everyone. Let's get started with the Q3 product strategy review. We've got a lot to cover today."),
        (2,  marcus, 15.0,  28.3,  "Thanks Sarah. Before we dive in, I want to flag that the mobile team's velocity numbers are in the deck I shared this morning."),
        (3,  sarah,  29.0,  45.0,  "Perfect. So let's start with where we landed on OKRs. We hit 78% on our key results for Q2, which is above our 75% target."),
        (4,  priya,  46.0,  65.0,  "The biggest win was the checkout flow redesign. We saw a 23% lift in conversion rate which directly impacted revenue by about 1.2 million dollars this quarter."),
        (5,  jordan, 66.0,  82.0,  "That's fantastic. On the growth side, DAUs are up 34% month over month since we launched the onboarding revamp in mid-June."),
        (6,  sarah,  83.0,  105.0, "Great numbers. Now for Q3 — our north star is shipping the collaborative workspace feature. That's the single biggest unlock for enterprise sales."),
        (7,  marcus, 106.0, 125.0, "Engineering scoped it at 8 weeks with a team of 5. We'd need to pull two engineers from the mobile roadmap though, which delays the iOS offline mode by about 3 weeks."),
        (8,  priya,  126.0, 148.0, "Sales has been asking for collaborative workspace every single call. I'd say the trade-off is worth it if we can close the 3 enterprise deals that are currently in the pipeline."),
        (9,  jordan, 149.0, 168.0, "From a marketing standpoint, I can build a campaign around the enterprise angle. We'd want to announce at the September conference ideally."),
        (10, sarah,  169.0, 190.0, "Agreed. Let's make that the plan. Marcus, can you work with the mobile lead to document the impact on their roadmap so we have a clear trade-off memo for the executive team?"),
        (11, marcus, 191.0, 210.0, "Absolutely. I'll have that ready by end of week. I also want to bring up the API latency issues we've been seeing. P99 is at 480ms which is above our SLA."),
        (12, sarah,  211.0, 232.0, "Yes, that's on the radar. We're spinning up a performance task force — Rahul's leading it. The goal is to get P99 under 200ms by August 15th."),
        (13, priya,  233.0, 252.0, "Can we also talk about the pricing page? Our A/B test data shows that the three-tier pricing structure outperforms the current two-tier by 18% on plan upgrades."),
        (14, jordan, 253.0, 272.0, "I've been pushing for that change for a while. The messaging on the pro tier especially needs work — customers don't understand what they're getting."),
        (15, sarah,  273.0, 296.0, "Let's greenlight the three-tier pricing rollout. Priya, can you own that alongside your current work, or do you need support?"),
        (16, priya,  297.0, 315.0, "I can own it. I'll need about a week to finalize the copy and work with design on the page layout. We could ship by end of July."),
        (17, marcus, 316.0, 335.0, "Engineering estimate for the pricing page changes is 3 days, so that's very doable. We just need the final copy from Priya before we start dev."),
        (18, sarah,  336.0, 358.0, "Perfect. Let's also not forget the integrations roadmap. The Slack and Salesforce integrations are table-stakes for enterprise customers."),
        (19, jordan, 359.0, 380.0, "I can confirm that — every enterprise prospect has asked about Salesforce. If we can ship that in Q3 alongside collaborative workspace, the September conference story becomes very compelling."),
        (20, sarah,  381.0, 405.0, "Alright, let's capture the action items and wrap up. We've made good decisions today. Thanks everyone — Marcus, Priya, Jordan, great input as always."),
        (21, marcus, 406.0, 418.0, "Thanks Sarah. I'll send the trade-off memo and loop in the mobile lead today."),
        (22, priya,  419.0, 430.0, "Will start on the pricing copy this afternoon."),
    ]

    for seq, speaker, start, end, text in initial_segments:
        db.add(TranscriptSegment(
            meeting_id=meeting.id,
            participant_id=speaker.id,
            start_time=start,
            end_time=end,
            text=text,
            sequence=seq,
        ))

    turns = [
        (sarah, "Let's dive deeper into the collaborative workspace specifications. Marcus, how are we handling real-time presence and live cursor tracking?"),
        (marcus, "We are using a WebSocket state vector broadcast architecture. Each connected user streams light mouse coordinates and active selection ranges at 30Hz."),
        (priya, "From a user experience standpoint, live cursors make a huge difference in enterprise demos. Prospects want to see active co-editing in real time."),
        (jordan, "I can definitely highlight presence in the marketing collateral. It immediately communicates modern async collaboration rather than static documentation."),
        (sarah, "What about role-based access control within the workspace? We need to make sure permissions are strict before enterprise beta testing."),
        (marcus, "We have implemented four permission tiers: Workspace Admin, Editor, Commenter, and Viewer. Admins control user management and data export privileges."),
        (priya, "That permission hierarchy matches what enterprise security teams ask for. Especially the distinction between Commenter and Editor roles."),
        (jordan, "We should document those permission tiers clearly in our product launch guide. Security leads always inspect role-based access controls closely."),
        (sarah, "Great. Let's ensure comment threads can be resolved and anchored to specific text blocks or transcript timestamps."),
        (marcus, "Yes, comment anchors use persistent offset indices. Even if text surrounding the comment is edited, the anchor remains bound to the correct context."),
        (sarah, "Now let's revisit the mobile team reallocation. Marcus, you mentioned moving two engineers from iOS offline mode to the collaborative workspace effort."),
        (marcus, "That's right. Moving Dave and Maya to the core workspace team gives us the velocity needed to hit the September 8th feature complete target."),
        (priya, "What is the revised release date for iOS offline mode then? We need to manage expectations for mobile-heavy accounts."),
        (marcus, "iOS offline mode shifts from late August to mid-September. Critical bug fixes for the current iOS app will still be released on schedule."),
        (sarah, "That trade-off is acceptable. Let's make sure we publish an updated internal release calendar so customer success is aware of the mobile shift."),
        (jordan, "I will update the product roadmap slides for the sales team so no one promises iOS offline mode before mid-September."),
        (marcus, "The mobile codebase is stable, so delaying offline storage synchronization won't create technical debt or regression risks."),
        (priya, "I'll proactively reach out to our top three mobile-first pilot accounts to explain the priority shift toward collaborative workspace."),
        (sarah, "Priya, let's discuss the three-tier pricing model rollout. Can you walk us through the proposed pricing structure?"),
        (priya, "Sure. Tier 1 is Free for individual users with 300 transcription minutes per month. Tier 2 is Pro at $19 per user per month with unlimited transcription and AI summaries."),
        (jordan, "And Tier 3 is Enterprise, which includes custom pricing, SAML SSO, SOC 2 compliance documentation, and dedicated customer success support."),
        (marcus, "From an engineering perspective, feature gating by pricing tier is handled via JWT claim verification in our API gateway."),
        (sarah, "What is our migration strategy for legacy users currently on the old two-tier plan?"),
        (priya, "Legacy users will be grandfathered in for 90 days. After that, they can transition to Pro with a 20% discount for their first annual cycle."),
        (jordan, "I am preparing an email campaign to announce the new pricing model. We will lead with the added value of AI summaries and workspace collaboration."),
        (sarah, "Let's make sure the checkout flow has zero friction. A/B testing on the pricing page showed an 18% lift with the three-tier layout."),
        (marcus, "The billing integration with Stripe has been updated to handle tiered seat expansion and prorated billing upgrades automatically."),
        (priya, "That will save customer operations a ton of manual invoicing work as enterprise teams scale their seat count."),
        (sarah, "Let's turn to infrastructure performance. Marcus, what is the status of the API latency reduction task force?"),
        (marcus, "Rahul's team has brought P99 latency down from 480ms to 310ms by optimizing compound database indexes on transcript query endpoints."),
        (priya, "That is noticeable improvement. Slow search response times were a friction point in our larger customer review sessions."),
        (marcus, "Our goal is to reach P99 latency under 200ms by August 28th. We are deploying a Redis caching layer for frequent search queries next sprint."),
        (jordan, "Fast transcript search is a core selling point. When users search across hundreds of recorded calls, results need to appear instantly."),
        (sarah, "How are we handling database connection pooling as concurrent meeting processing scales up?"),
        (marcus, "We implemented PgBouncer connection pooling and optimized SQLAlchemy session lifecycle management to prevent connection starvation."),
        (sarah, "Excellent work. Keep monitoring P99 latency during peak usage hours and report back in next week's sync."),
        (jordan, "I want to touch on the enterprise integrations. Salesforce and Slack integrations are generating a lot of inbound interest."),
        (priya, "Salesforce integration is table stakes for enterprise sales teams. Automatically pushing meeting notes into CRM Opportunity records is huge."),
        (marcus, "The Salesforce integration uses OAuth 2.0 and syncs call summaries, sentiment scores, and action items directly to custom CRM fields."),
        (jordan, "And the Slack integration posts automated post-meeting digests into dedicated channel threads with clickable timestamp links."),
        (sarah, "Can workspace admins configure which Slack channels receive meeting digests automatically?"),
        (marcus, "Yes, admins can map specific meeting categories or team channels to dedicated Slack channels with custom privacy controls."),
        (priya, "That privacy control is vital. HR and finance meetings need to remain restricted while product syncs can post to open channels."),
        (jordan, "I am creating demo videos for both Slack and Salesforce integrations to feature on our product website and landing pages."),
        (sarah, "Jordan, what insights came out of the recent Customer Advisory Board session?"),
        (jordan, "Overall feedback was overwhelmingly positive. Customers loved the automatic action item extraction and speaker separation accuracy."),
        (priya, "Did they request any specific enhancements for the Q3 release?"),
        (jordan, "Top request was multi-format export: exporting transcripts and summaries to PDF, Markdown, and Notion pages with one click."),
        (marcus, "Adding PDF and Markdown export is straightforward. We can implement a clean export service in Sprint 43."),
        (sarah, "Let's prioritize Markdown and PDF export for Q3. That adds immediate utility for product and engineering teams taking notes."),
        (priya, "Customer Advisory Board members also asked if AI summaries could be customized using company-specific terminology glossaries."),
        (jordan, "Custom vocabulary support would be fantastic for specialized industries like legal, medical, and financial services."),
        (marcus, "We can allow admins to define custom keyword lists that seed the AI prompt context during transcript summarization."),
        (sarah, "Let me summarize our action items and final alignment before we wrap up today's product review."),
        (marcus, "Engineering feature complete and code freeze for collaborative workspace is set for September 8th."),
        (jordan, "Marketing launch announcement and 'State of Async Work' research report release are scheduled for early September before the conference."),
        (priya, "Sales team enablement and enterprise pricing collateral rollout will take place during the final week of August."),
        (sarah, "To recap our action items: Marcus owns the mobile trade-off memo and P99 latency optimization. Priya owns pricing copy and enterprise sales prep."),
        (jordan, "I will finalize the marketing brief, complete the case study outreach, and coordinate design deliverables."),
        (sarah, "Great session today everyone. We have a clear strategy and solid alignment across product, engineering, sales, and marketing. Thanks for your time!")
    ]

    _extend_transcript(db, meeting, turns, start_seq=23, start_time=431.0)

    db.add(Summary(
        meeting_id=meeting.id,
        overview=(
            "The team reviewed Q2 OKR results (78% achievement, above target) and aligned on Q3 priorities. "
            "Collaborative workspace was confirmed as the top priority for Q3, with a strategic trade-off of "
            "delaying iOS offline mode by 3 weeks. A three-tier pricing rollout was greenlit, and performance "
            "improvements (P99 latency target: <200ms) were assigned to a dedicated task force."
        ),
        key_points=[
            "Q2 OKR achievement rate: 78% — above the 75% target",
            "Checkout flow redesign delivered $1.2M revenue lift and 23% conversion improvement",
            "DAU growth 34% MoM since onboarding revamp launch",
            "Collaborative workspace approved as Q3 top priority (8-week build)",
            "Trade-off accepted: iOS offline mode delayed 3 weeks to staff collaborative workspace",
            "Three-tier pricing structure to replace two-tier pricing — ships end of July",
            "P99 API latency target: under 200ms by August 15th",
            "Salesforce and Slack integrations prioritized for enterprise pipeline",
        ],
        created_at=now,
        updated_at=now,
    ))

    db.add_all([
        Topic(meeting_id=meeting.id, name="Q2 OKR Results Review", start_time=29.0),
        Topic(meeting_id=meeting.id, name="Q3 North Star: Collaborative Workspace", start_time=83.0),
        Topic(meeting_id=meeting.id, name="Mobile Roadmap Trade-offs", start_time=106.0),
        Topic(meeting_id=meeting.id, name="Three-Tier Pricing Rollout", start_time=233.0),
        Topic(meeting_id=meeting.id, name="API Performance & Integrations", start_time=336.0),
        Topic(meeting_id=meeting.id, name="Workspace Permissions & RBAC Specs", start_time=495.0),
        Topic(meeting_id=meeting.id, name="Three-Tier Pricing Details & Migration", start_time=719.0),
        Topic(meeting_id=meeting.id, name="Infrastructure SLA & P99 Latency", start_time=895.0),
        Topic(meeting_id=meeting.id, name="Enterprise CRM & Slack Integrations", start_time=1007.0),
        Topic(meeting_id=meeting.id, name="Customer Advisory Board Feedback", start_time=1135.0),
        Topic(meeting_id=meeting.id, name="Q3 Roadmap Milestones & Execution", start_time=1279.0),
        Topic(meeting_id=meeting.id, name="Mobile Reallocation & Feature Shifting", start_time=1551.0),
        Topic(meeting_id=meeting.id, name="Enterprise Security & Integration Alignment", start_time=1967.0),
        Topic(meeting_id=meeting.id, name="Q3 Key Deliverables & Action Items", start_time=2239.0),
        Topic(meeting_id=meeting.id, name="Integration Rollout & Final Decisions", start_time=2927.0),
        Topic(meeting_id=meeting.id, name="Workspace Role Control & Final Wrap-Up", start_time=3375.0),
    ])

    db.add_all([
        ActionItem(meeting_id=meeting.id, title="Draft trade-off memo for executive team re: mobile roadmap impact", description="Document the impact of reallocating 2 engineers to collaborative workspace on iOS offline mode timeline.", assignee_id=marcus.id, due_date=_due(5), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Finalize three-tier pricing page copy", description="Write copy for all three tiers and coordinate with design on page layout. Target: ship by end of July.", assignee_id=priya.id, due_date=_due(7), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Set up performance task force kickoff with Rahul", description="Goal is P99 latency under 200ms by August 15th.", assignee_id=sarah.id, due_date=_due(3), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Build enterprise marketing campaign for September conference", description="Campaign should lead with collaborative workspace and Salesforce integration.", assignee_id=jordan.id, due_date=_due(21), completed=False, created_at=now, updated_at=now),
    ])

    db.commit()
    print(f"  [created] {title}")


# ---------------------------------------------------------------------------
# Meeting 2 — Engineering Sprint Planning — Sprint 42
# ---------------------------------------------------------------------------

def seed_sprint_planning(db: Session) -> None:
    title = "Engineering Sprint Planning — Sprint 42"
    if db.query(Meeting).filter(Meeting.title == title).first():
        print(f"  [skip] {title}")
        return

    now = datetime.now(timezone.utc)
    meeting = Meeting(
        title=title,
        description="Two-week sprint planning session for the platform engineering team. Capacity planning, story point estimation, and blocker identification.",
        meeting_date=_utc(2026, 7, 21, 9, 0),
        duration_seconds=2880,
        created_at=now,
        updated_at=now,
    )
    db.add(meeting)
    db.flush()

    alex = _get_or_create_participant(db, "Alex Ramirez", "alex.ramirez@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=alex")
    nina = _get_or_create_participant(db, "Nina Okafor", "nina.okafor@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=nina")
    marcus = _get_or_create_participant(db, "Marcus Williams", "marcus.williams@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus")
    tom = _get_or_create_participant(db, "Tom Suzuki", "tom.suzuki@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=tom")
    elena = _get_or_create_participant(db, "Elena Vasquez", "elena.vasquez@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=elena")

    _add_participants(db, meeting, [alex, nina, marcus, tom, elena])

    initial_segments = [
        (1,  alex,   0.0,   18.0,  "Morning everyone. Sprint 41 is wrapping up today. Let's do a quick velocity check before we plan Sprint 42."),
        (2,  nina,   19.0,  38.0,  "We committed to 84 story points and delivered 79. The two incomplete stories are the WebSocket reconnection logic — turns out the library we chose has a bug in Safari."),
        (3,  tom,    39.0,  58.0,  "Yeah, I spent two days on that. The workaround I found works but it's not clean. I'd want another day to refactor before we ship."),
        (4,  marcus, 59.0,  75.0,  "Let's carry those two stories into Sprint 42 with the refactor time baked in. Tom, can you add a sub-task for the Safari polyfill?"),
        (5,  tom,    76.0,  88.0,  "Done. I'll add it before end of day."),
        (6,  alex,   89.0,  112.0, "Alright. For Sprint 42 we have 82 points of capacity — Nina's out for 3 days next week. Let's pull from the backlog. Marcus, what's highest priority from the roadmap perspective?"),
        (7,  marcus, 113.0, 135.0, "The collaborative workspace data sync layer is the most critical. That's the foundation everything else sits on. Engineering estimate is 34 points — is that right Nina?"),
        (8,  nina,   136.0, 155.0, "Yes, 34 points for the sync engine. I'd want to pair with Elena on the conflict resolution algorithm — that's the tricky part and I don't want it to be a single point of failure."),
        (9,  elena,  156.0, 175.0, "Happy to pair on that. I've been reading about CRDTs and I think we can use a simpler approach than what the ticket currently describes."),
        (10, alex,   176.0, 198.0, "Let's schedule a 90-minute design session for the conflict resolution approach before you start coding. I want to make sure we don't paint ourselves into a corner architecturally."),
        (11, nina,   199.0, 218.0, "Agreed. How about Tuesday at 2pm? I'll send the invite."),
        (12, marcus, 219.0, 240.0, "Next priority is the REST API for workspace membership management — 18 points. Then we have the notification service refactor at 13 points."),
        (13, elena,  241.0, 262.0, "I can take the workspace membership API. I did the original user management API last quarter so I know that domain well."),
        (14, tom,    263.0, 282.0, "I'll pick up the notification service refactor after I finish the WebSocket cleanup. Those two feel related — both are about connection management."),
        (15, alex,   283.0, 305.0, "That's 34 + 18 + 13 = 65 points plus the 7 carried over from Sprint 41. That's 72 out of 82 capacity. Let's pull in one more medium ticket."),
        (16, nina,   306.0, 325.0, "The Redis caching layer for the search service is 11 points and has been sitting in the backlog for two sprints. It would meaningfully improve search latency."),
        (17, elena,  326.0, 345.0, "I can start on that after the membership API — or we could split it. I'll take the cache invalidation logic which is the complex part, Tom takes the cache warm-up."),
        (18, tom,    346.0, 362.0, "Works for me. Cache warm-up is straightforward."),
        (19, alex,   363.0, 385.0, "Perfect, 83 points which is just over our 82 capacity but close enough. Any blockers I need to know about before we lock the sprint?"),
        (20, nina,   386.0, 408.0, "Still waiting on DevOps to provision the staging Redis cluster. I've followed up twice. If we don't have it by Wednesday, the caching work will slip."),
        (21, marcus, 409.0, 428.0, "I'll escalate that today. I'll ping the DevOps lead directly — this has been pending too long."),
        (22, alex,   429.0, 450.0, "Good. Let's lock the sprint board. I'll post a summary in the engineering Slack channel. Thanks everyone — let's have a clean sprint."),
    ]

    for seq, speaker, start, end, text in initial_segments:
        db.add(TranscriptSegment(
            meeting_id=meeting.id,
            participant_id=speaker.id,
            start_time=start,
            end_time=end,
            text=text,
            sequence=seq,
        ))

    turns = [
        (alex, "Let's break down the 34 story points for the collaborative workspace sync engine into concrete engineering sub-tasks."),
        (nina, "The sync engine requires three core modules: state vector exchange, delta compression, and client-side optimistic UI updates."),
        (elena, "For state vector exchange, I recommend using a JSON patch delta format over WebSockets so payload size stays minimal."),
        (tom, "On the frontend, the optimistic UI layer will render local edits instantly while waiting for WebSocket server confirmation."),
        (marcus, "How are we handling concurrent edit conflicts when two users modify the exact same sentence simultaneously?"),
        (nina, "We are implementing a Conflict-free Replicated Data Type algorithm with Last-Write-Wins timestamps per character node."),
        (elena, "Nina and I scheduled a 90-minute architecture design session for Tuesday at 2pm to finalize the CRDT vector clock spec."),
        (alex, "Great. Make sure to document the edge case behavior for network disconnects during active editing sessions."),
        (tom, "Regarding the Safari WebSocket bug from Sprint 41, I tested a heartbeat ping strategy to prevent Safari from dropping background connections."),
        (alex, "How reliable is the heartbeat ping in Safari on iOS and macOS?"),
        (tom, "Heartbeat every 15 seconds keeps the connection alive consistently. If it drops, the client automatically falls back to HTTP long polling."),
        (marcus, "Having a seamless fallback to long polling guarantees reliability even behind strict enterprise corporate firewalls."),
        (nina, "I will write integration tests for the WebSocket reconnect logic under simulated 3G and packet loss network profiles."),
        (tom, "I'll spend one day refactoring the frontend socket listener hooks so state recovery is completely transparent to the user."),
        (alex, "Awesome. That cleanly closes out the carried-over Sprint 41 issue with zero user impact."),
        (elena, "For the Workspace Membership API, I am building endpoints for adding members, updating roles, and revoking invitations."),
        (marcus, "Make sure role changes enforce security checks at the API gateway layer using RBAC middleware."),
        (elena, "Yes, all membership endpoints check `workspace:manage` permissions before executing database mutations."),
        (tom, "On the frontend, I'll build the team settings modal where workspace admins can manage team member invitations."),
        (alex, "What is the story point breakdown for the membership API and UI combined?"),
        (elena, "Backend API is estimated at 10 points, and Tom's frontend UI management interface is 8 points, totaling 18 points."),
        (tom, "The notification service refactor will decouple event generation from delivery channels like email and push notifications."),
        (nina, "We are introducing a Redis Pub/Sub message broker so background workers process email delivery asynchronously."),
        (marcus, "Async worker queues will prevent email dispatch latency from blocking main API response times."),
        (tom, "We are also adding notification batching: if a user receives 5 comments in 10 minutes, we send one summarized email digest."),
        (alex, "Batching is great for reducing email fatigue. That's a solid UX improvement."),
        (elena, "For search caching, we will cache transcript search queries in Redis using SHA-256 query hashes as keys."),
        (marcus, "What is the cache TTL strategy for active meetings versus archived meetings?"),
        (elena, "Active meetings have a 60-second TTL with instant cache invalidation on new transcript segment inserts. Archived meetings use 24-hour TTL."),
        (nina, "That cache invalidation hook is clean and avoids serving stale transcript search results to active users."),
        (alex, "Marcus, you are escalating the staging Redis cluster provisioning to DevOps today, right?"),
        (marcus, "Yes, I spoke with DevOps Lead Dave this morning. Staging Redis will be ready by tomorrow afternoon at 2pm."),
        (alex, "Let's review our testing strategy and Definition of Done for Sprint 42 deliverables."),
        (nina, "All PRs must include unit tests with at least 85% code coverage and pass automated CI linting checks."),
        (elena, "We are also requiring end-to-end Cypress test coverage for the Workspace Membership invite flow."),
        (tom, "On the frontend side, component tests in Storybook will verify responsive layout rendering across mobile and desktop breakpoints."),
        (marcus, "Load testing with k6 will simulate 5,000 concurrent WebSocket connections to verify memory stability under load."),
        (alex, "That is a thorough testing plan. Let's make sure code reviews are completed within 24 hours of PR submission."),
        (alex, "To wrap up Sprint 42 planning: total committed capacity is 83 story points across 5 engineers."),
        (nina, "Collaborative sync engine, membership API, notification refactor, and Redis caching give us a high-impact sprint."),
        (marcus, "DevOps escalation is in progress, design session is scheduled, and individual story assignments are locked in Jira."),
        (tom, "I'm ready to kick off dev work on the WebSocket reconnect refactor immediately after this call."),
        (elena, "Same here — starting on the Membership API endpoints right away."),
        (alex, "Excellent. Thanks for the productive session everyone. Let me lock the sprint board and post our summary in Slack!")
    ]

    _extend_transcript(db, meeting, turns, start_seq=23, start_time=451.0)

    db.add(Summary(
        meeting_id=meeting.id,
        overview=(
            "Sprint 41 closed at 79/84 story points (94% completion). The two incomplete stories involve "
            "WebSocket reconnection with a Safari browser bug. Sprint 42 was planned with 82 points of capacity, "
            "pulling in the collaborative workspace sync engine (34 pts), workspace membership API (18 pts), "
            "notification refactor (13 pts), and Redis caching (11 pts). A design session was scheduled for "
            "CRDT-based conflict resolution. Staging Redis provisioning was identified as a blocker."
        ),
        key_points=[
            "Sprint 41 velocity: 79/84 points — 94% completion rate",
            "WebSocket reconnection stories carried forward due to Safari library bug",
            "Sprint 42 capacity: 82 points (Nina out 3 days)",
            "Collaborative workspace sync engine is the critical path item at 34 story points",
            "CRDT conflict resolution design session scheduled for Tuesday 2pm",
            "Redis caching for search blocked on staging cluster provisioning from DevOps",
            "Sprint 42 total commitment: 83 story points across 5 engineers",
        ],
        created_at=now,
        updated_at=now,
    ))

    db.add_all([
        Topic(meeting_id=meeting.id, name="Sprint 41 Velocity Review", start_time=0.0),
        Topic(meeting_id=meeting.id, name="Sprint 42 Backlog Prioritization", start_time=89.0),
        Topic(meeting_id=meeting.id, name="CRDT Conflict Resolution Architecture", start_time=156.0),
        Topic(meeting_id=meeting.id, name="Capacity Planning & Story Assignment", start_time=283.0),
        Topic(meeting_id=meeting.id, name="Blockers & Escalations", start_time=363.0),
        Topic(meeting_id=meeting.id, name="Safari WebSocket Heartbeat Fix", start_time=579.0),
        Topic(meeting_id=meeting.id, name="Workspace Membership API & RBAC", start_time=691.0),
        Topic(meeting_id=meeting.id, name="Notification Service & Event Bus", start_time=787.0),
        Topic(meeting_id=meeting.id, name="Redis Search Cache Architecture", start_time=867.0),
        Topic(meeting_id=meeting.id, name="Definition of Done & Testing Matrix", start_time=963.0),
        Topic(meeting_id=meeting.id, name="Sprint Commitment & Team Assignment", start_time=1059.0),
        Topic(meeting_id=meeting.id, name="Network Recovery & Reconnection Logic", start_time=1283.0),
        Topic(meeting_id=meeting.id, name="Automated Testing & Load Benchmarks", start_time=1667.0),
        Topic(meeting_id=meeting.id, name="API Gateway & Security Policy Review", start_time=2099.0),
        Topic(meeting_id=meeting.id, name="Final Sprint Board Alignment & Wrap-Up", start_time=2467.0),
    ])

    db.add_all([
        ActionItem(meeting_id=meeting.id, title="Add Safari WebSocket polyfill sub-task to Sprint 42 board", assignee_id=tom.id, due_date=_due(1), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Schedule CRDT conflict resolution design session (Tuesday 2pm)", assignee_id=nina.id, due_date=_due(2), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Escalate staging Redis cluster provisioning to DevOps lead", description="Blocking the Redis caching stories. Must be resolved by Wednesday or Sprint 42 scope needs adjustment.", assignee_id=marcus.id, due_date=_due(1), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Post Sprint 42 summary to engineering Slack channel", assignee_id=alex.id, due_date=_due(1), completed=False, created_at=now, updated_at=now),
    ])

    db.commit()
    print(f"  [created] {title}")


# ---------------------------------------------------------------------------
# Meeting 3 — Client Discovery: Meridian Financial
# ---------------------------------------------------------------------------

def seed_client_discovery(db: Session) -> None:
    title = "Client Discovery: Meridian Financial"
    if db.query(Meeting).filter(Meeting.title == title).first():
        print(f"  [skip] {title}")
        return

    now = datetime.now(timezone.utc)
    meeting = Meeting(
        title=title,
        description="Initial discovery call with Meridian Financial to understand their meeting intelligence and compliance documentation needs.",
        meeting_date=_utc(2026, 7, 28, 11, 0),
        duration_seconds=2700,
        created_at=now,
        updated_at=now,
    )
    db.add(meeting)
    db.flush()

    priya = _get_or_create_participant(db, "Priya Patel", "priya.patel@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=priya")
    jordan = _get_or_create_participant(db, "Jordan Lee", "jordan.lee@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan")
    diana = _get_or_create_participant(db, "Diana Foster", "diana.foster@meridian.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=diana")
    kevin = _get_or_create_participant(db, "Kevin Park", "kevin.park@meridian.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=kevin")

    _add_participants(db, meeting, [priya, jordan, diana, kevin])

    initial_segments = [
        (1,  priya,  0.0,   22.0,  "Diana, Kevin — thanks for joining. We're excited to learn more about Meridian Financial's needs. Can you start by telling us about the biggest pain points in how your team documents meetings today?"),
        (2,  diana,  23.0,  55.0,  "Sure. We have about 200 advisors across 12 regional offices. Each advisor has multiple client meetings per week — review sessions, onboarding calls, compliance check-ins. Right now everything is documented manually. Advisors are spending 45 minutes to an hour after each meeting just writing notes."),
        (3,  kevin,  56.0,  80.0,  "The compliance angle is huge for us. FINRA requires us to document specific disclosures in client meetings. Right now we have no way to audit whether advisors are actually covering the required topics."),
        (4,  jordan, 81.0,  102.0, "That's a really compelling use case. Our platform can flag whether specific topics were discussed and generate a compliance report automatically. Is that something you'd want to see in a demo?"),
        (5,  diana,  103.0, 128.0, "Absolutely. That would be transformative for us. We had a FINRA audit last year that was incredibly stressful because we couldn't quickly surface meeting documentation. We spent three weeks pulling records manually."),
        (6,  priya,  129.0, 152.0, "I completely understand. Let me ask — what does your current tech stack look like for meetings? Are advisors using Zoom, Teams, something else?"),
        (7,  kevin,  153.0, 175.0, "It's a mix. About 60% use Zoom, the rest are on Teams. We'd ideally want a solution that works with both without requiring advisors to change their workflow."),
        (8,  priya,  176.0, 200.0, "We support both Zoom and Teams natively. The bot joins automatically — advisors don't need to do anything differently. After the meeting they get a transcript and summary in their inbox within minutes."),
        (9,  diana,  201.0, 228.0, "The data residency question will come up with our legal team. We operate in a regulated environment. Can you tell me where data is stored and whether you're SOC 2 certified?"),
        (10, priya,  229.0, 252.0, "We're SOC 2 Type II certified. Data is stored in AWS US-East-1 by default, and we offer dedicated tenancy for enterprise customers. I'll send over our security documentation after this call."),
        (11, kevin,  253.0, 278.0, "That's good to hear. One more concern — advisor adoption. Our advisors are not the most tech-savvy group. If the setup is complicated, we'll see low adoption and the ROI falls apart."),
        (12, jordan, 279.0, 305.0, "Adoption is something we've thought a lot about. The average time to first meeting recorded is under 5 minutes. We have onboarding specialists who work with enterprise customers to drive adoption across large teams."),
        (13, diana,  306.0, 330.0, "That's reassuring. I think we're ready to move to a product demo. What does that process look like on your end?"),
        (14, priya,  331.0, 358.0, "We'd schedule a 60-minute demo next week. I'll have our solutions engineer join to walk through the compliance workflow specifically. After that we can put together a pilot proposal — typically 30 advisors for 60 days."),
        (15, kevin,  359.0, 378.0, "Sounds good. Can you also include pricing in the follow-up materials? We'll need to build a business case internally and cost is a factor."),
        (16, priya,  379.0, 400.0, "Absolutely. I'll send a tailored pricing sheet for a 200-seat enterprise deployment along with the security docs. Jordan, can you help me put that together this afternoon?"),
        (17, jordan, 401.0, 415.0, "Yes, I'll have a draft to you by 3pm."),
        (18, diana,  416.0, 432.0, "Perfect. We're also evaluating two other vendors, so the more specific and detailed your materials are, the better."),
        (19, priya,  433.0, 450.0, "Noted. We'll make sure the proposal is specific to financial services and addresses the FINRA documentation requirement directly. Thanks Diana, Kevin — really helpful conversation."),
    ]

    for seq, speaker, start, end, text in initial_segments:
        db.add(TranscriptSegment(
            meeting_id=meeting.id,
            participant_id=speaker.id,
            start_time=start,
            end_time=end,
            text=text,
            sequence=seq,
        ))

    turns = [
        (kevin, "Priya, from a regulatory standpoint, FINRA Rule 204-2 requires strict record-keeping standards for advisor-client discussions."),
        (priya, "Understood, Kevin. Our enterprise platform provides 7-year WORM-compliant storage with immutable audit logging."),
        (kevin, "That is critical. If an advisor makes verbal disclosures regarding investment risks, we must demonstrate proof during audit reviews."),
        (jordan, "Our system automatically tags compliance disclosures and flags missing required phrases using custom keyword detection models."),
        (diana, "Can compliance managers review automated keyword flags across all 12 regional offices from a central dashboard?"),
        (priya, "Yes, Diana. The Central Compliance Dashboard allows compliance officers to filter meetings by office, advisor, or risk score."),
        (kevin, "Does the transcript audit trail capture who viewed or exported a specific meeting recording?"),
        (jordan, "Every view, playback event, transcript export, or search query is logged with timestamp, user IP, and user ID in an unalterable log."),
        (diana, "That level of transparency will satisfy our legal and compliance committee during our upcoming annual audit."),
        (diana, "Let's talk about technical deployment across our 200 advisors. Half use Microsoft Teams and half use Zoom."),
        (jordan, "Our integration connects at the tenant level via Microsoft Entra ID and Zoom Admin SDK. Individual advisors do not need to install local software."),
        (kevin, "How does the recording bot handle external client calls where clients join from mobile phones or web browsers?"),
        (priya, "The bot joins as a quiet participant, plays an automated audio disclosure if configured, and records multi-party audio cleanly."),
        (diana, "Can advisors turn off automatic meeting recording for personal or internal one-on-one calls?"),
        (jordan, "Advisors can set recording rules by calendar event type, or pause/stop recording at any time using simple in-meeting controls."),
        (kevin, "That flexibility is important for maintaining trust while ensuring mandatory client calls are captured without exception."),
        (diana, "Where is client data hosted, and how is encryption handled at rest and in transit?"),
        (jordan, "All data is encrypted using AES-256 at rest and TLS 1.3 in transit. Hosting is in AWS US-East-1 with dedicated VPC isolation."),
        (priya, "We also support Customer-Managed Encryption Keys via AWS KMS, so Meridian Financial retains absolute control over data decryption."),
        (kevin, "Have you completed a SOC 2 Type II audit by an independent accounting firm?"),
        (priya, "Yes, we are SOC 2 Type II certified. I will share our full SOC 2 report, ISO 27001 certificate, and VAPT penetration test summary."),
        (diana, "That satisfies our infosec vendor assessment checklist. Our CISO will review those documents during procurement."),
        (diana, "Our senior advisors can be resistant to adopting new software. What onboarding support do you provide?"),
        (jordan, "We provide a dedicated Customer Success Manager who runs 15-minute live onboarding workshops for each regional office."),
        (priya, "We also supply short video quickstarts and interactive cheat sheets so advisors get comfortable with the platform in minutes."),
        (kevin, "If executive leadership endorses the tool as a compliance safeguard rather than a surveillance tool, adoption will be smooth."),
        (diana, "I agree. We will frame this as an automated assistant that saves advisors 45 minutes of manual note-taking after every call."),
        (priya, "We recommend starting with a 30-advisor pilot across three regional offices—say New York, Chicago, and San Francisco."),
        (diana, "A 60-day pilot with 30 advisors gives us ample time to evaluate meeting capture quality and advisor time savings."),
        (kevin, "What metrics do you track during the pilot to measure success?"),
        (jordan, "We track meeting capture rate, average post-meeting note editing time, action item completion rate, and compliance coverage score."),
        (priya, "During the pilot, we hold weekly 15-minute syncs with your team to review platform telemetry and adjust settings."),
        (diana, "What does enterprise pricing look like for a full 200-seat deployment following a successful pilot?"),
        (priya, "Our enterprise tier is $35 per seat per month billed annually, which includes dedicated CSM, custom integrations, and KMS encryption."),
        (kevin, "What is the timeline for Master Services Agreement legal review and vendor risk assessment?"),
        (priya, "Typically legal review takes 10 to 14 business days. We can provide our standard MSA draft and Security Questionnaire answers today."),
        (jordan, "We are excited to demonstrate the compliance workflow in detail during our 60-minute technical demo next Tuesday."),
        (diana, "Thank you Priya and Jordan. This call was extremely informative. We look forward to receiving the proposal and demo invite!")
    ]

    _extend_transcript(db, meeting, turns, start_seq=20, start_time=451.0)

    db.add(Summary(
        meeting_id=meeting.id,
        overview=(
            "Initial discovery call with Meridian Financial (200 advisors across 12 offices). "
            "Key pain points: manual note-taking (45-60 min per meeting), FINRA compliance documentation gaps, "
            "and difficulty auditing advisor-client conversations. The prospect expressed strong interest in "
            "automated compliance reporting and supports Zoom + Teams. Next steps: product demo with "
            "compliance workflow focus, followed by a 30-advisor, 60-day pilot proposal."
        ),
        key_points=[
            "200 advisors across 12 regional offices — high-volume, regulated meeting environment",
            "Advisors spend 45-60 minutes per meeting on manual documentation",
            "FINRA compliance audit is a critical pain point — no way to verify topic coverage",
            "60% Zoom / 40% Teams split — both supported natively",
            "SOC 2 Type II certification and AWS US-East-1 data residency confirmed",
            "Prospect is evaluating two other vendors — differentiation on compliance depth is key",
            "Next step: 60-minute product demo with solutions engineer, focus on compliance workflow",
            "30-advisor, 60-day pilot proposal to follow demo",
        ],
        created_at=now,
        updated_at=now,
    ))

    db.add_all([
        Topic(meeting_id=meeting.id, name="Current State: Manual Note-taking Pain", start_time=23.0),
        Topic(meeting_id=meeting.id, name="FINRA Compliance Requirements", start_time=56.0),
        Topic(meeting_id=meeting.id, name="Tech Stack & Integration Requirements", start_time=129.0),
        Topic(meeting_id=meeting.id, name="Security, Data Residency & SOC 2", start_time=201.0),
        Topic(meeting_id=meeting.id, name="Next Steps: Demo & Pilot Proposal", start_time=306.0),
        Topic(meeting_id=meeting.id, name="FINRA Rule 204-2 Record Keeping", start_time=451.0),
        Topic(meeting_id=meeting.id, name="Enterprise Zoom & Teams Deployment", start_time=595.0),
        Topic(meeting_id=meeting.id, name="KMS Encryption & SOC 2 Certification", start_time=707.0),
        Topic(meeting_id=meeting.id, name="Advisor Change Management & Onboarding", start_time=819.0),
        Topic(meeting_id=meeting.id, name="30-Advisor Pilot Framework", start_time=883.0),
        Topic(meeting_id=meeting.id, name="Enterprise Seat Pricing & MSA Review", start_time=963.0),
        Topic(meeting_id=meeting.id, name="Tenant-Level Auth & Bot Controls", start_time=1203.0),
        Topic(meeting_id=meeting.id, name="Enterprise Licensing & Pilot Telemetry", start_time=1571.0),
        Topic(meeting_id=meeting.id, name="Security Assessment & Penetration Test Review", start_time=1923.0),
        Topic(meeting_id=meeting.id, name="Technical Demo Alignment & Final Wrap-Up", start_time=2275.0),
    ])

    db.add_all([
        ActionItem(meeting_id=meeting.id, title="Send security documentation and SOC 2 report to Meridian", assignee_id=priya.id, due_date=_due(1), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Prepare tailored pricing sheet for 200-seat enterprise deployment", description="Include financial services industry-specific use cases and FINRA compliance features.", assignee_id=jordan.id, due_date=_due(1), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Schedule 60-minute product demo — focus on compliance workflow", description="Include solutions engineer. Invite Diana Foster and Kevin Park.", assignee_id=priya.id, due_date=_due(3), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Draft 30-advisor pilot proposal for Meridian Financial", description="60-day pilot, address FINRA documentation requirements specifically.", assignee_id=priya.id, due_date=_due(7), completed=False, created_at=now, updated_at=now),
    ])

    db.commit()
    print(f"  [created] {title}")


# ---------------------------------------------------------------------------
# Meeting 4 — Marketing Campaign Planning: Q3 Launch
# ---------------------------------------------------------------------------

def seed_marketing_planning(db: Session) -> None:
    title = "Marketing Campaign Planning: Q3 Launch"
    if db.query(Meeting).filter(Meeting.title == title).first():
        print(f"  [skip] {title}")
        return

    now = datetime.now(timezone.utc)
    meeting = Meeting(
        title=title,
        description="Planning session for Q3 product launch marketing campaign across content, paid, and events channels.",
        meeting_date=_utc(2026, 8, 4, 13, 0),
        duration_seconds=3240,
        created_at=now,
        updated_at=now,
    )
    db.add(meeting)
    db.flush()

    jordan = _get_or_create_participant(db, "Jordan Lee", "jordan.lee@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan")
    maya = _get_or_create_participant(db, "Maya Singh", "maya.singh@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=maya")
    carlos = _get_or_create_participant(db, "Carlos Mendez", "carlos.mendez@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos")
    rachel = _get_or_create_participant(db, "Rachel Thompson", "rachel.thompson@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=rachel")

    _add_participants(db, meeting, [jordan, maya, carlos, rachel])

    initial_segments = [
        (1,  jordan, 0.0,   22.0,  "Alright team, we've got a big Q3 ahead of us. The collaborative workspace launch is our biggest product moment of the year. I want us to walk out of this meeting with a concrete campaign plan."),
        (2,  maya,   23.0,  48.0,  "I've been thinking about the messaging framework. Our core audience for this feature is mid-market and enterprise — teams of 50 to 500 where async collaboration is a real pain point. The headline I'm testing is: 'Your meetings, finally working together.'"),
        (3,  carlos, 49.0,  72.0,  "I like that direction. On the paid side, our CPL for LinkedIn in the B2B segment has been about 85 dollars. For this campaign I'm thinking we focus on job titles — Head of Product, VP Engineering, Engineering Manager — because they feel the async collaboration pain directly."),
        (4,  rachel, 73.0,  95.0,  "From a content perspective, I want to lead with a 'State of Async Work' report. We can collect survey data from our existing user base, get some third-party quotes, and position ourselves as the authority on this topic."),
        (5,  jordan, 96.0,  118.0, "That's a great idea Rachel. If we time the report release two weeks before the feature launch, it creates a conversation we can then plug the product into. What's the timeline to produce something like that?"),
        (6,  rachel, 119.0, 140.0, "If we start the survey this week, I can have a draft report in three weeks. Final version ready to publish in four weeks — that lines up well with a mid-August release for the report."),
        (7,  maya,   141.0, 165.0, "Mid-August for the report, then the product launch announcement in early September before the conference. That's a nice two-punch. Conference demo becomes the live proof point."),
        (8,  carlos, 166.0, 188.0, "For the paid campaign I'll need creative assets — at least 3 ad variations for LinkedIn and 3 for Google Display. Can design commit to having assets ready by August 20th so we can do a soft launch of the paid campaign?"),
        (9,  jordan, 189.0, 210.0, "I'll check with the design team today. They're stretched right now with the pricing page redesign, but I think we can sequence it. Rachel, can you provide the messaging brief to design by end of this week?"),
        (10, rachel, 211.0, 228.0, "Yes, I'll have the messaging brief ready by Friday. That gives design two weeks to produce the assets."),
        (11, maya,   229.0, 255.0, "We should also think about the launch email sequence. I'm thinking a 4-email drip to our existing user base — teaser, feature announcement, how-to guide, and a customer story. Do we have a customer willing to be a launch reference?"),
        (12, jordan, 256.0, 278.0, "Dataflow Analytics has been using the beta. I spoke to their head of product last week and they're very happy. I'll ask if they'd participate in a case study."),
        (13, carlos, 279.0, 300.0, "A Dataflow case study would be perfect — they're exactly our ICP. If we can get it in time, we can feature it in the email sequence and on the landing page."),
        (14, rachel, 301.0, 322.0, "For SEO, I want to make sure we're targeting 'meeting collaboration software' and 'async meeting tools' — those have decent search volume and lower competition than the head terms."),
        (15, maya,   323.0, 345.0, "I'll audit our existing landing page copy and update the meta descriptions and H1s. I can also write a supporting blog post that targets those keywords — good for organic ranking ahead of launch."),
        (16, jordan, 346.0, 368.0, "Great. Let's also think about the conference itself. We have a 10x10 booth. I want to run a live demo every hour on the half-hour — 6 demos per day, 2 days. Who's staffing the booth?"),
        (17, carlos, 369.0, 390.0, "I can do the first day. I've done conference demos before and I know the pitch well. We'd want someone technical for the second day in case questions get deep."),
        (18, rachel, 391.0, 410.0, "I'll coordinate with engineering to have someone available for day two. Maybe we can get one of the product engineers who built the feature — always good for demos."),
        (19, jordan, 411.0, 430.0, "Perfect. Let me summarize what we've committed to. Rachel — state of async work report and messaging brief. Carlos — paid campaign setup. Maya — landing page, email sequence, blog post. I'll handle the case study ask and design coordination."),
        (20, maya,   431.0, 445.0, "Can we set up a weekly check-in to track against these milestones? The launch is 7 weeks away and there's a lot of parallel work happening."),
        (21, jordan, 446.0, 458.0, "Absolutely. Let's do Mondays at 9am. I'll send the recurring invite. Great session everyone."),
    ]

    for seq, speaker, start, end, text in initial_segments:
        db.add(TranscriptSegment(
            meeting_id=meeting.id,
            participant_id=speaker.id,
            start_time=start,
            end_time=end,
            text=text,
            sequence=seq,
        ))

    turns = [
        (jordan, "Let's review the survey execution for our 'State of Async Work' research report. Rachel, how is survey distribution progressing?"),
        (rachel, "We launched the survey yesterday across our newsletter and LinkedIn. We already have 340 responses out of our 500 target!"),
        (maya, "That is fantastic velocity! The preliminary data shows 72% of respondents spend over 15 hours a week in meetings."),
        (carlos, "That statistic is gold for our paid ad creatives. 'Spending 15+ hours in meetings? Let AI take your notes' will perform really well."),
        (rachel, "I am compiling the raw survey data into four key theme chapters: Meeting Overload, Action Item Churn, Async Shift, and AI Impact."),
        (jordan, "What is the design timeline for the report PDF and infographic summary graphics?"),
        (maya, "Design will receive the finalized copy by August 8th and complete the 16-page report layout by August 15th."),
        (maya, "Our core campaign tagline is 'Your meetings, finally working together.' It emphasizes team collaboration over isolated note-taking."),
        (jordan, "How are we positioning against traditional transcription tools that only output raw text walls without structured action items?"),
        (rachel, "We position as a Meeting Intelligence Platform. We don't just transcribe; we extract decisions, action items, and topic chapters."),
        (carlos, "I am building sales enablement battlecards so our SDRs can articulate this positioning clearly when competing against legacy tools."),
        (carlos, "For paid media, we are allocating 60% of budget to LinkedIn Sponsored Content, 30% to Google Search, and 10% to retargeting."),
        (jordan, "What job title targeting parameters are we setting on LinkedIn?"),
        (carlos, "We are targeting Head of Product, VP of Engineering, Engineering Manager, and Director of Operations at companies with 50-500 employees."),
        (maya, "Our target Cost Per Lead is $85. We are creating three ad variations: problem-focused, feature-focused, and customer quote-focused."),
        (rachel, "Google Search ad groups will target high-intent keywords like 'meeting intelligence software', 'automated meeting notes', and 'Slack meeting bot'."),
        (maya, "The email drip sequence consists of four emails sent over two weeks following the launch announcement."),
        (jordan, "Walk us through the email sequence flow."),
        (maya, "Email 1 is a teaser video. Email 2 is the launch announcement. Email 3 is a feature deep-dive. Email 4 features the Dataflow case study."),
        (rachel, "We are A/B testing subject lines for Email 2 between 'Introducing Collaborative Workspaces' and 'The future of meeting notes is here'."),
        (jordan, "I spoke with Dataflow Analytics VP of Product yesterday. They officially approved participating in our launch case study!"),
        (rachel, "That is huge! Dataflow Analytics is a recognizable brand in the tech space. Their testimonial validates enterprise readiness."),
        (maya, "I will conduct the 20-minute video interview with Dataflow on Thursday and draft the written case study by next Monday."),
        (carlos, "We can clip 30-second video snippets from the Dataflow interview to run as video ads on LinkedIn during launch week."),
        (rachel, "For organic SEO, we are publishing four supporting blog articles around async meeting workflows prior to launch day."),
        (maya, "Article 1 covers 'How to Run Effective Async Product Reviews'. Article 2 covers 'Top 5 FINRA Meeting Compliance Best Practices'."),
        (rachel, "Articles 3 and 4 target 'Collaborative Note Taking for Remote Teams' and 'Integrating Meeting Notes with Jira and Slack'."),
        (carlos, "I'll make sure internal linking from these blog posts points directly to our new collaborative workspace landing page."),
        (jordan, "Let's review our 10x10 booth setup for the September tech conference. Carlos, you're staffing Day 1?"),
        (carlos, "Yes, I'll staff Day 1. We will run live 5-minute product demos every hour on the half-hour using large touchscreen displays."),
        (rachel, "I coordinated with engineering—Senior Backend Engineer Tom Suzuki will staff Day 2 for technical and architecture questions."),
        (maya, "We ordered 500 branded tech organizers and notebook sets as booth giveaways for attendees who complete a demo."),
        (jordan, "Everything is tracking smoothly. Weekly Monday 9am syncs will monitor milestone progress across creative, paid, content, and events."),
        (maya, "I'll update the master launch checklist in Notion after this call."),
        (rachel, "Messaging brief goes to design on Friday."),
        (carlos, "Paid ad campaigns soft launch on August 20th."),
        (jordan, "Great work team. Let's execute cleanly and make this launch our biggest success of the year!")
    ]

    _extend_transcript(db, meeting, turns, start_seq=22, start_time=459.0)

    db.add(Summary(
        meeting_id=meeting.id,
        overview=(
            "The marketing team planned the Q3 collaborative workspace launch campaign. "
            "Strategy: lead with a 'State of Async Work' research report in mid-August, "
            "followed by the product launch announcement in early September timed to the conference. "
            "Channels: LinkedIn/Google paid (targeting Head of Product, VP Engineering), "
            "email drip (4 emails to existing users), SEO-driven blog content, and a conference booth with hourly demos."
        ),
        key_points=[
            "Campaign theme: 'Your meetings, finally working together'",
            "Target audience: mid-market and enterprise teams (50-500 employees)",
            "'State of Async Work' report to launch mid-August as thought leadership anchor",
            "Product launch announcement timed for early September pre-conference",
            "Paid campaign targets: Head of Product, VP Engineering, Engineering Manager on LinkedIn",
            "LinkedIn CPL baseline: $85 — 3 ad variations per channel needed by August 20th",
            "4-email drip sequence to existing user base at launch",
            "Dataflow Analytics identified as potential launch reference customer for case study",
            "Conference booth: hourly demos (6/day × 2 days), Carlos day 1 / engineer day 2",
            "Weekly Monday check-ins established to track campaign milestones",
        ],
        created_at=now,
        updated_at=now,
    ))

    db.add_all([
        Topic(meeting_id=meeting.id, name="Campaign Messaging Framework", start_time=23.0),
        Topic(meeting_id=meeting.id, name="'State of Async Work' Research Report", start_time=96.0),
        Topic(meeting_id=meeting.id, name="Paid Advertising Strategy", start_time=166.0),
        Topic(meeting_id=meeting.id, name="Email Drip & Customer Story", start_time=229.0),
        Topic(meeting_id=meeting.id, name="Conference Booth & Demo Planning", start_time=346.0),
        Topic(meeting_id=meeting.id, name="Research Survey & Data Themes", start_time=459.0),
        Topic(meeting_id=meeting.id, name="Positioning & Sales Enablement Battlecards", start_time=571.0),
        Topic(meeting_id=meeting.id, name="Paid Media Budget & LinkedIn Targeting", start_time=635.0),
        Topic(meeting_id=meeting.id, name="4-Part Email Drip & Nurture Sequence", start_time=715.0),
        Topic(meeting_id=meeting.id, name="Dataflow Analytics Case Study Approval", start_time=779.0),
        Topic(meeting_id=meeting.id, name="Content Clusters & SEO Strategy", start_time=843.0),
        Topic(meeting_id=meeting.id, name="Conference Booth Activation & Hourly Demos", start_time=907.0),
        Topic(meeting_id=meeting.id, name="Case Study Assets & Video Snippets", start_time=1371.0),
        Topic(meeting_id=meeting.id, name="Multi-Channel Paid Acquisition Plan", start_time=1819.0),
        Topic(meeting_id=meeting.id, name="Launch Readiness Checklist & Notion Tracker", start_time=2235.0),
        Topic(meeting_id=meeting.id, name="Conference Lead Gen & Demo Logistics", start_time=2683.0),
    ])

    db.add_all([
        ActionItem(meeting_id=meeting.id, title="Launch 'State of Async Work' survey to user base", assignee_id=rachel.id, due_date=_due(3), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Write and deliver messaging brief to design team by Friday", assignee_id=rachel.id, due_date=_due(4), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Set up LinkedIn and Google paid campaigns — 3 ad variations each", description="Targeting Head of Product, VP Engineering, Engineering Manager. Soft launch August 20th.", assignee_id=carlos.id, due_date=_due(14), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Ask Dataflow Analytics head of product to participate in launch case study", assignee_id=jordan.id, due_date=_due(2), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Send recurring Monday 9am campaign check-in calendar invite", assignee_id=jordan.id, due_date=_due(1), completed=False, created_at=now, updated_at=now),
    ])

    db.commit()
    print(f"  [created] {title}")


# ---------------------------------------------------------------------------
# Meeting 5 — Weekly Leadership Sync
# ---------------------------------------------------------------------------

def seed_leadership_sync(db: Session) -> None:
    title = "Weekly Leadership Sync — Week 31"
    if db.query(Meeting).filter(Meeting.title == title).first():
        print(f"  [skip] {title}")
        return

    now = datetime.now(timezone.utc)
    meeting = Meeting(
        title=title,
        description="Weekly cross-functional leadership sync covering product, engineering, sales, and operations. Focus: Q3 progress, headcount, and risk review.",
        meeting_date=_utc(2026, 8, 11, 8, 30),
        duration_seconds=2400,
        created_at=now,
        updated_at=now,
    )
    db.add(meeting)
    db.flush()

    sarah = _get_or_create_participant(db, "Sarah Chen", "sarah.chen@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah")
    marcus = _get_or_create_participant(db, "Marcus Williams", "marcus.williams@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus")
    priya = _get_or_create_participant(db, "Priya Patel", "priya.patel@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=priya")
    jordan = _get_or_create_participant(db, "Jordan Lee", "jordan.lee@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=jordan")
    victor = _get_or_create_participant(db, "Victor Osei", "victor.osei@acme.com", "https://api.dicebear.com/7.x/avataaars/svg?seed=victor")

    _add_participants(db, meeting, [sarah, marcus, priya, jordan, victor])

    initial_segments = [
        (1,  sarah,  0.0,   18.0,  "Good morning everyone. Quick agenda today — Q3 progress check, headcount updates, and a risk discussion. Let's go around. Victor, let's start with ops and finance."),
        (2,  victor, 19.0,  45.0,  "Revenue for July came in at 2.4 million, which is 96% of target. Gross margin held at 72%. The miss was primarily in mid-market new ARR — we had 3 deals slip to August. Cash runway is 18 months at current burn."),
        (3,  sarah,  46.0,  62.0,  "18 months is comfortable. The slipped deals — Priya, what's the status on those?"),
        (4,  priya,  63.0,  88.0,  "Two are verbal yes, procurement is the blocker. Third one is stalled because their internal champion left the company. I'm re-engaging with the new stakeholder this week. I'm confident we close two of the three in August."),
        (5,  sarah,  89.0,  105.0, "Good. Let's count on two of three. Marcus, engineering update?"),
        (6,  marcus, 106.0, 130.0, "Collaborative workspace sync engine is 40% complete — we're on track for the September 8th feature complete date. The performance task force hit a milestone: P99 latency is down to 310ms, progress from 480ms but still above the 200ms target."),
        (7,  sarah,  131.0, 148.0, "310ms is meaningful progress. What's the path to 200ms?"),
        (8,  marcus, 149.0, 172.0, "Two things: database query optimization which Rahul is working on — that should get us to 250ms. The last 50ms is likely going to require a caching layer, which is what we're planning for Sprint 42."),
        (9,  sarah,  173.0, 192.0, "Timeline to 200ms target?"),
        (10, marcus, 193.0, 210.0, "August 28th is my current estimate — 2 weeks past the original target of August 15th. I wanted to surface that here."),
        (11, sarah,  211.0, 232.0, "Noted. Two weeks isn't ideal but I can live with it if the collaborative workspace stays on track. Please flag immediately if August 28th looks at risk."),
        (12, jordan, 233.0, 258.0, "Marketing update — campaign is taking shape. The 'State of Async Work' survey is live, 340 responses in the first 48 hours. Report draft will be ready August 8th. Paid campaigns go live August 20th. We're in good shape for the September conference."),
        (13, sarah,  259.0, 275.0, "Good. I want a pre-read of the report before it's published. Can you send me a draft when it's ready?"),
        (14, jordan, 276.0, 282.0, "Of course, I'll send it directly."),
        (15, sarah,  283.0, 305.0, "Victor — headcount. We approved two engineering hires in Q2 and one sales hire. Where are we?"),
        (16, victor, 306.0, 330.0, "Engineering offers have been extended. One candidate accepted, starts September 1st. Second candidate is comparing us against another offer — decision expected Friday. The sales hire is still in the final round of interviews, two candidates remaining."),
        (17, marcus, 331.0, 352.0, "The September 1st start for engineering is helpful. We're going to need ramp time before they can contribute to collaborative workspace, so the timing is tight but workable."),
        (18, sarah,  353.0, 375.0, "If we lose the second engineering candidate, what's the impact to the September 8th deadline?"),
        (19, marcus, 376.0, 398.0, "We can absorb it — that hire was planned as additional capacity, not critical path. The existing team can ship on schedule. It would stress the team a bit but we'd make it."),
        (20, sarah,  399.0, 420.0, "Alright. Two risks I want to formally flag: latency target slipping and the second engineering candidate. Let's check both next week. Anything else before we close?"),
        (21, priya,  421.0, 438.0, "One thing — the Meridian Financial demo is next Tuesday. If it goes well, it could be our largest enterprise deal. I'd like executive air cover if they want to talk contract terms."),
        (22, sarah,  439.0, 455.0, "I'm available Tuesday afternoon. Just ping me if you need me to join. Good meeting everyone. See you next week."),
    ]

    for seq, speaker, start, end, text in initial_segments:
        db.add(TranscriptSegment(
            meeting_id=meeting.id,
            participant_id=speaker.id,
            start_time=start,
            end_time=end,
            text=text,
            sequence=seq,
        ))

    turns = [
        (victor, "Let's dive into July financial details. Total revenue landed at $2.4M, representing 96% of our Q3 monthly plan."),
        (sarah, "Gross margins remained steady at 72%. COGS increases were driven primarily by higher transcription GPU usage."),
        (victor, "Our net cash burn for July was $185K. With $3.3M cash in bank, our runway extends comfortably to 18 months."),
        (priya, "The revenue miss was due to three mid-market ARR deals slipping into August during legal review."),
        (sarah, "Priya, what is our forecast for closing those three slipped accounts this month?"),
        (priya, "Two accounts are in final contract signature. The third account required re-engaging their new VP of Ops following champion churn."),
        (victor, "Closing two of the three accounts in August adds $140K in ARR, putting us back on track for Q3 targets."),
        (marcus, "On engineering execution: the collaborative workspace sync engine is 40% complete and tracking toward the September 8th GA date."),
        (sarah, "What is the update from the API performance task force regarding latency SLA targets?"),
        (marcus, "P99 latency has dropped from 480ms to 310ms. Query optimization is complete, and Redis caching will push us under 200ms by August 28th."),
        (sarah, "August 28th is two weeks past our original target, but acceptable given the parallel progress on collaborative workspace."),
        (jordan, "Faster API response times directly benefit marketing conversion when prospects test live search during free trials."),
        (jordan, "Marketing update: our 'State of Async Work' research survey gathered 340 responses in its first 48 hours!"),
        (sarah, "That is strong engagement. I'd like a pre-read of the report draft before publication on August 15th."),
        (jordan, "I will send you the PDF draft on August 8th. Paid ad campaigns will soft launch on August 20th ahead of the September conference."),
        (priya, "Sales enablement materials for the new three-tier pricing model are being reviewed by the sales team this week."),
        (victor, "Hiring update: Senior Backend Engineer candidate Alex accepted our offer and starts September 1st!"),
        (marcus, "Alex brings extensive real-time WebSocket experience, which will be instrumental for post-launch scaling."),
        (victor, "Our second engineering offer candidate is evaluating compensation against another offer; decision expected Friday."),
        (priya, "Sales AE candidate interviews are in final rounds. We expect to extend an offer by next Wednesday."),
        (priya, "The Meridian Financial client discovery call went exceptionally well. They represent a 200-seat enterprise opportunity."),
        (sarah, "Meridian Financial is a marquee financial services name. What is their primary buying trigger?"),
        (priya, "Automated FINRA compliance documentation and seamless Zoom/Teams integration across 12 regional offices."),
        (jordan, "We scheduled their 60-minute technical demo for next Tuesday. Solutions engineering is leading the presentation."),
        (sarah, "I am available to join the Tuesday demo as executive sponsor if commercial negotiations require CEO presence."),
        (sarah, "Let's review our formal risk log: latency target 2-week slip, second engineering hire decision, and Meridian contract timeline."),
        (victor, "All three risks have clear mitigation plans and owner accountability assigned."),
        (marcus, "Engineering capacity is stable even if the second candidate declines, so September 8th feature complete is secure."),
        (priya, "Sales pipeline coverage for Q3 stands at 3.4x, providing healthy cushion for target achievement."),
        (sarah, "Excellent progress across all departments. Let's stay focused on execution. Thank you everyone!")
    ]

    _extend_transcript(db, meeting, turns, start_seq=23, start_time=456.0)

    db.add(Summary(
        meeting_id=meeting.id,
        overview=(
            "Week 31 leadership sync covered July revenue performance ($2.4M, 96% of target), "
            "collaborative workspace engineering progress (40% complete, on track for September 8th), "
            "performance task force progress (P99 at 310ms, target 200ms by August 28th — 2 weeks late), "
            "marketing campaign status (survey live, 340 responses), "
            "and headcount: one engineering hire confirmed for September 1st, one pending."
        ),
        key_points=[
            "July revenue: $2.4M — 96% of target; gross margin 72%; 18-month runway",
            "3 mid-market deals slipped to August — 2 expected to close, 1 at-risk due to champion churn",
            "Collaborative workspace: 40% complete, September 8th feature-complete date on track",
            "P99 latency at 310ms — improved from 480ms but still above 200ms target",
            "Latency target revised to August 28th (2 weeks late) — escalation risk",
            "'State of Async Work' survey: 340 responses in 48 hours — strong engagement",
            "1 engineering offer accepted (start September 1st), 1 offer pending decision Friday",
            "Meridian Financial demo scheduled for Tuesday — largest potential enterprise deal",
            "Formal risks logged: latency target slip, second engineering hire outcome",
        ],
        created_at=now,
        updated_at=now,
    ))

    db.add_all([
        Topic(meeting_id=meeting.id, name="July Revenue & Financial Review", start_time=19.0),
        Topic(meeting_id=meeting.id, name="Collaborative Workspace Engineering Progress", start_time=106.0),
        Topic(meeting_id=meeting.id, name="Marketing Campaign Status", start_time=233.0),
        Topic(meeting_id=meeting.id, name="Headcount & Hiring Update", start_time=283.0),
        Topic(meeting_id=meeting.id, name="Risk Review & Meridian Financial", start_time=399.0),
        Topic(meeting_id=meeting.id, name="Financial Results & Cash Runway Review", start_time=456.0),
        Topic(meeting_id=meeting.id, name="Mid-Market Deal Pipeline & Recovery", start_time=520.0),
        Topic(meeting_id=meeting.id, name="Collaborative Workspace & Latency Roadmap", start_time=568.0),
        Topic(meeting_id=meeting.id, name="State of Async Work Report & Paid Launch", start_time=648.0),
        Topic(meeting_id=meeting.id, name="Engineering & Sales Candidate Hiring Update", start_time=712.0),
        Topic(meeting_id=meeting.id, name="Meridian Financial Enterprise Demo Strategy", start_time=776.0),
        Topic(meeting_id=meeting.id, name="Executive Risk Review & Mitigation Plan", start_time=856.0),
        Topic(meeting_id=meeting.id, name="Revenue Growth & Runway Forecast", start_time=1192.0),
        Topic(meeting_id=meeting.id, name="Core Engineering Milestones & SLA Targets", start_time=1528.0),
        Topic(meeting_id=meeting.id, name="Risk Matrix & Executive Support Confirmation", start_time=1816.0),
    ])

    db.add_all([
        ActionItem(meeting_id=meeting.id, title="Flag immediately if August 28th P99 latency target is at risk", assignee_id=marcus.id, due_date=_due(14), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Send 'State of Async Work' report pre-read draft to Sarah", assignee_id=jordan.id, due_date=_due(5), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Re-engage new stakeholder at stalled mid-market account", description="Champion left the company — need to re-establish relationships with replacement.", assignee_id=priya.id, due_date=_due(3), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Confirm Meridian Financial demo attendance and ping Sarah if executive presence needed", assignee_id=priya.id, due_date=_due(6), completed=False, created_at=now, updated_at=now),
        ActionItem(meeting_id=meeting.id, title="Follow up on second engineering candidate decision by Friday", assignee_id=victor.id, due_date=_due(4), completed=False, created_at=now, updated_at=now),
    ])

    db.commit()
    print(f"  [created] {title}")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    print("Seeding database...")
    db: Session = SessionLocal()
    try:
        seed_product_strategy(db)
        seed_sprint_planning(db)
        seed_client_discovery(db)
        seed_marketing_planning(db)
        seed_leadership_sync(db)
        print("Seeding complete.")
    except Exception as exc:
        db.rollback()
        print(f"Seeding failed: {exc}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
