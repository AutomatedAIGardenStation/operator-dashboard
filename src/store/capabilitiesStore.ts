import { create } from 'zustand';

interface CapabilitiesState {
  // Store a set of missing capabilities
  missingCapabilities: Set<string>;

  // Method to check if an API route is missing
  isCapabilityMissing: (capability: string) => boolean;

  // Method to mark a capability as missing
  markCapabilityMissing: (capability: string) => void;

  // Initialize capabilities
  initCapabilities: (capabilities: string[]) => void;

  // Clear the state
  resetCapabilities: () => void;
}

// Full list of frontend API requests
const ALL_CAPABILITIES = [
  'GET /sensors', 'GET /sensors/:id', 'GET /sensors/:id/history', 'GET /sensors/history',
  'GET /actuators', 'GET /actuators/:id', 'POST /actuators/:id/activate', 'POST /actuators/water/start',
  'POST /actuators/water/stop', 'PUT /actuators/light', 'PUT /actuators/fan', 'POST /actuators/:id/deactivate', 'GET /actuators/:id/status',
  'GET /plants', 'GET /plants/:id', 'POST /plants', 'PUT /plants/:id', 'DELETE /plants/:id',
  'GET /harvest/queue', 'POST /harvest/queue', 'POST /harvest/:id/trigger',
  'POST /valves/set',
  'POST /tools/dock', 'POST /tools/release', 'GET /tools/current',
  'POST /gantry/move', 'POST /gantry/home', 'GET /gantry/position',
  'GET /system/status', 'GET /system/config', 'POST /system/config', 'PUT /system/config', 'POST /system/reboot',
  'GET /chambers', 'GET /chambers/:id',
  'POST /ml/infer', 'GET /ml/models',
  'POST /auth/login', 'POST /auth/refresh', 'POST /auth/logout',
  'POST /dosing/recipe', 'POST /pump/run'
];

function matchCapability(requestCapability: string, storedCapabilities: Set<string>): boolean {
  // If exact match, return true
  if (storedCapabilities.has(requestCapability)) {
    return true;
  }

  // Convert numbers and UUIDs in the request capability to `:id` for matching
  const [method, path] = requestCapability.split(' ');
  if (!path) return false;

  const pathParts = path.split('/');
  const generalizedPathParts = pathParts.map(part => {
    // Match numbers
    if (/^\d+$/.test(part)) return ':id';
    // Match UUIDs (simple format)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part)) return ':id';
    return part;
  });

  const generalizedCapability = `${method} ${generalizedPathParts.join('/')}`;
  return storedCapabilities.has(generalizedCapability);
}

export const useCapabilitiesStore = create<CapabilitiesState>()((set, get) => ({
  missingCapabilities: new Set(),

  isCapabilityMissing: (capability: string) => {
    return matchCapability(capability, get().missingCapabilities);
  },

  markCapabilityMissing: (capability: string) => {
    set((state) => {
      const newSet = new Set(state.missingCapabilities);
      const [method, path] = capability.split(' ');

      let generalizedCapability = capability;
      if (path) {
          const pathParts = path.split('/');
          const generalizedPathParts = pathParts.map(part => {
            if (/^\d+$/.test(part)) return ':id';
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(part)) return ':id';
            return part;
          });
          generalizedCapability = `${method} ${generalizedPathParts.join('/')}`;
      }

      newSet.add(generalizedCapability);
      return { missingCapabilities: newSet };
    });
  },

  initCapabilities: (capabilities: string[]) => {
    // Determine which capabilities from ALL_CAPABILITIES are missing in the provided `capabilities` array.
    // Assuming backend returns a list of supported capability strings like `GET /sensors`
    const supportedSet = new Set(capabilities);
    const missing = new Set<string>();

    ALL_CAPABILITIES.forEach(cap => {
       if (!supportedSet.has(cap)) {
           missing.add(cap);
       }
    });

    set({ missingCapabilities: missing });
  },

  resetCapabilities: () => {
    set({ missingCapabilities: new Set() });
  }
}));

// Listen to custom event to clear capability cache on logout
window.addEventListener('gs:capabilities-reset', () => {
  useCapabilitiesStore.getState().resetCapabilities();
});

export const useCapability = (capability: string) => {
  const missingCapabilities = useCapabilitiesStore(state => state.missingCapabilities);
  return !matchCapability(capability, missingCapabilities);
};
