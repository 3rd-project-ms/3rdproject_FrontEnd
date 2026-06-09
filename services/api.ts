// services/api.ts
// 백엔드 공통 axios 클라이언트
// 모든 응답은 { success, code, message, data } 형태(CommonResponse)로 내려온다.
import axios, { AxiosError } from 'axios';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://3rdprojectbackend-production.up.railway.app';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── 백엔드 공통 응답 래퍼 ──
export interface CommonResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
}

/** 백엔드/네트워크 오류를 사용자 메시지와 함께 던지기 위한 에러 타입 */
export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * CommonResponse 응답을 풀어 data만 반환한다.
 * success=false 이거나 네트워크 오류면 ApiError를 던진다.
 */
export function unwrap<T>(
  promise: Promise<{ data: CommonResponse<T> }>
): Promise<T> {
  return promise.then(
    (res) => {
      const body = res.data;
      if (!body?.success) {
        throw new ApiError(
          body?.message ?? '요청을 처리하지 못했습니다.',
          body?.code
        );
      }
      return body.data;
    },
    (error: AxiosError<CommonResponse<unknown>>) => {
      const body = error.response?.data;
      throw new ApiError(
        body?.message ?? '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        body?.code,
        error.response?.status
      );
    }
  );
}
