import api from "./axios";

// Define types if needed (optional)
interface DeviceConfiguration {
  name: string;
  pollIntervalMs: number;
  protocolSettingsJson: string;
}

interface Device {
  id?: string;
  name: string;
  description: string;
  protocol?: string;
  configuration?: DeviceConfiguration; // add configuration
//   signals?: Signal[];
}

/**
 * 🔹 Get all devices
 */
export const getDevices = async () => {
  const response = await api.get("/api/devices");
  return response.data.data;
};

/**
 * 🔹 Create a new device
 */
export const createDevice = async (device: Device) => {
  const response = await api.post("/api/devices", device);
  return response.data.data;
};

/**
 * 🔹 Get device by ID
 */
export const getDeviceById = async (id: string) => {
  const response = await api.get(`/api/devices/${id}`);
  return response.data.data;
};

/**
 * 🔹 Update a device by ID
 */
export const updateDevice = async (id: string, device: Device) => {
  const response = await api.put(`/api/devices/${id}`, device);
  return response.data.data;
};

/**
 * 🔹 Delete a device by ID
 */
export const deleteDevice = async (id: string) => {
  const response = await api.delete(`/api/devices/${id}`);
  return response.data.data;


};
export const retriveDeviceById = async (id: string) => {
  const response = await api.post(`/api/devices/${id}/restore`);
  return response.data.data;


};


export const getDeletedDeviced = async () => {
  const response = await api.get(`api/devices/deleted`);
  return response.data.data;
};
