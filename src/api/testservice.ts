import api from "./axios";

// Define the type for response data
interface HelloResponse {
  message: string;
}

export const getHello = async (): Promise<HelloResponse> => {
  const response = await api.get<HelloResponse>("/api/test/hello");
  return response.data;
};

interface PostRequest {
  name: string;
}

interface PostResponse {
  message: string;
  name: string;
}

export const sendName = async (data: PostRequest): Promise<PostResponse> => {
  const response = await api.post<PostResponse>("/api/test/send", data);
  return response.data;
};
