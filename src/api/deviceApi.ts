import api from "./axios";


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
  configuration?: DeviceConfiguration; 

}



export const getDevices = async (pageNumber = 1, pageSize = 10, searchTerm = "") => {
  const response = await api.get("/api/devices", {
    params: { pageNumber, pageSize, searchTerm },
  });
  return response.data.data; 
};


export const createDevice = async (device: Device) => {
  const response = await api.post("/api/devices", device);
  return response.data.data;
};


export const getDeviceById = async (id: string) => {
  const response = await api.get(`/api/devices/${id}`);
  return response.data.data;
};


export const updateDevice = async (id: string, device: Device) => {
  const response = await api.put(`/api/devices/${id}`, device);
  return response.data.data;
};


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
