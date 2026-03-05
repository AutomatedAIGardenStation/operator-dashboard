// ── Auth ──

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ── Sensors ──

export interface SensorLocation {
  x: number;
  y: number;
  z: number;
}

export interface SensorCalibration {
  min: number;
  max: number;
  offset: number;
}

export interface Sensor {
  id: number;
  name: string;
  type: string;
  chamber_id: number;
  current_value: number;
  unit: string;
  status: string;
  last_reading: string;
  location: SensorLocation;
  calibration?: SensorCalibration;
  metadata?: Record<string, string>;
}

export interface SensorListResponse {
  sensors: Sensor[];
  total: number;
}

export interface SensorReading {
  timestamp: string;
  value: number;
  quality: string;
}

export interface SensorHistoryResponse {
  sensor_id: number;
  readings: SensorReading[];
  count: number;
}

export interface SensorHistoryParams {
  start_time?: string;
  end_time?: string;
  limit?: number;
  aggregation?: "avg" | "min" | "max" | "sum";
  interval?: "1h" | "1d" | "1w";
}

export interface SensorListParams {
  chamber_id?: number;
  type?: string;
  active?: boolean;
}

// ── Actuators ──

export interface ActuatorState {
  enabled: boolean;
  flow_rate?: number;
  total_volume?: number;
  elapsed_time?: number;
  volume_delivered?: number;
}

export interface Actuator {
  id: number;
  name: string;
  type: string;
  chamber_id: number;
  status: string;
  current_state: ActuatorState;
  capabilities?: Record<string, number>;
}

export interface ActuatorListResponse {
  actuators: Actuator[];
}

export interface ActuatorListParams {
  type?: string;
  chamber_id?: number;
}

export interface ActivateActuatorRequest {
  action: string;
  parameters?: {
    duration?: number;
    flow_rate?: number;
    volume?: number;
  };
}

export interface ActivateActuatorResponse {
  actuator_id: number;
  status: string;
  task_id: string;
  estimated_completion: string;
}

export interface ActuatorStatusResponse {
  id: number;
  status: string;
  current_state: ActuatorState;
  task?: {
    id: string;
    started_at: string;
    estimated_completion: string;
  };
}

// ── Plants ──

export interface PlantHealth {
  score: number;
  issues: string[];
  last_check?: string;
}

export interface PlantProfile {
  id: number;
  name: string;
  optimal_conditions?: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    soil_moisture: { min: number; max: number };
  };
}

export interface Plant {
  id: number;
  name: string;
  species: string;
  zone: string;
  moisture_target: number;
  ec_target: number;
  ph_min: number;
  ph_max: number;
  variety?: string;
  chamber_id?: number;
  location?: {
    module_id: number;
    position: SensorLocation;
  };
  planted_at: string;
  harvested_at?: string | null;
  status: string;
  growth_stage: string;
  health: PlantHealth;
  profile: PlantProfile;
  statistics?: {
    age_days: number;
    expected_harvest_days: number;
    water_consumption_liters: number;
    growth_rate: number;
  };
}

export interface PlantListResponse {
  plants: Plant[];
  total: number;
}

export interface PlantListParams {
  chamber_id?: number;
  status?: string;
  species?: string;
}

export interface CreatePlantRequest {
  name: string;
  species: string;
  zone: string;
  moisture_target: number;
  ec_target: number;
  ph_min: number;
  ph_max: number;
  variety?: string;
  chamber_id?: number;
  location?: {
    module_id: number;
    position: SensorLocation;
  };
  planted_at: string;
  profile_id: number;
}

export interface UpdatePlantRequest {
  name?: string;
  status?: string;
  notes?: string;
}

// ── Chambers ──

export interface ChamberEnvironment {
  temperature: number;
  humidity: number;
  light_level: number;
}

export interface Chamber {
  id: number;
  name: string;
  status: string;
  capacity: number;
  plants_count: number;
  environment: ChamberEnvironment;
  sensors: number[];
  actuators: number[];
}

export interface ChamberListResponse {
  chambers: Chamber[];
}

// ── ML ──

export interface InferenceRequest {
  model: string;
  image_url: string;
  parameters?: {
    confidence_threshold?: number;
  };
}

export interface Detection {
  class: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  ripeness?: string;
}

export interface InferenceResponse {
  inference_id: string;
  model: string;
  status: string;
  results: {
    detections: Detection[];
    processing_time_ms: number;
  };
}

export interface MLModel {
  id: string;
  name: string;
  version: string;
  type: string;
  status: string;
  capabilities: string[];
}

export interface MLModelsResponse {
  models: MLModel[];
}

// ── Harvest ──

export interface HarvestJob {
  id: string;
  plant_id: number;
  status: string;
  confidence: number;
  priority?: string;
  scheduled_at?: string;
  created_at: string;
}

export interface HarvestTask extends HarvestJob {}

export interface HarvestQueueResponse {
  tasks: HarvestJob[];
  total: number;
}

export interface HarvestQueueParams {
  status?: string;
  limit?: number;
}

export interface EnqueueHarvestRequest {
  plant_id: number;
  priority?: "low" | "normal" | "high";
  scheduled_at?: string;
  parameters?: {
    method?: string;
    storage_location?: string;
  };
}

export interface EnqueueHarvestResponse {
  task_id: string;
  status: string;
  position: number;
  estimated_start: string;
}

export interface UpdateHarvestTaskRequest {
  status: string;
  progress?: number;
  notes?: string;
}

// ── System ──

export interface SystemStatus {
  status: string;
  version: string;
  uptime_seconds: number;
  components: Record<string, string>;
  resources: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  };
  last_updated: string;
}

export interface SystemConfig {
  sensor_reading_interval?: number;
  auto_watering_enabled?: boolean;
  notification_settings?: {
    email?: boolean;
    push?: boolean;
  };
}

export interface ThresholdConfig {
  temp_max?: string;
  temp_min?: string;
  moisture_low?: string;
  ec_high?: string;
}

export interface RebootResponse {
  message: string;
  scheduled_at: string;
}

// ── Common ──

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp?: string;
    request_id?: string;
  };
}
