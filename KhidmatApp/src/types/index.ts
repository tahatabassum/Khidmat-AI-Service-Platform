export interface Provider {
    id: number;
    name: string;
    owner_name: string;
    service_type: string;
    area: string;
    city: string;
    rating: number;
    total_reviews: number;
    on_time_score: number;
    cancellation_rate: number;
    experience_years: number;
    skill_level: string;
    price_per_hour: number;
    distance_km: number;
    available: boolean;
    phone: string;
    slots: string;
    distance_label?: string;
    price_label?: string;
}

export interface Intent {
    service_type: string;
    location: string;
    time_preference: string;
    urgency: string;
    budget_sensitivity: string;
    job_complexity: string;
    language_detected: string;
    confidence_score: number;
    confirmation_needed: boolean;
}

export interface MatchInfo {
    provider_id: number;
    match_score: number;
    reasoning: string;
    is_closest: boolean;
}

export interface PricingBreakdown {
    base_rate: number;
    distance_cost: number;
    urgency_surcharge: number;
    complexity_surcharge: number;
    demand_surcharge: number;
    loyalty_discount: number;
}

export interface PricingQuote {
    quoted_price: number;
    price_breakdown: PricingBreakdown;
    budget_alternative: string;
    fairness_score: number;
}

export interface RankedProvider {
    provider: Provider;
    match_info: MatchInfo;
    pricing: PricingQuote;
}

export interface OrchestrateResponse {
    intent?: Intent;
    ranked_providers?: RankedProvider[];
    overall_recommendation?: string;
    agent_trace?: AgentTraceStep[];
    no_providers_found?: boolean;
    message?: string;
    clarification_needed?: boolean;
    question?: string;
}

export interface AgentTraceStep {
    agent: string;
    input: any;
    output: any;
    time_ms: number;
}

export interface Booking {
    id: number;
    booking_ref: string;
    provider_id: number;
    user_name: string;
    user_phone: string;
    service_type: string;
    location: string;
    slot: string;
    status: string;
    quoted_price: number;
    created_at: string;
    provider?: Provider;
    user_rating?: number;
    provider_rating?: number;
}
