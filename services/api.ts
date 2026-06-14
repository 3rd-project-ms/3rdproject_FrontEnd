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
 * 응답 body에 message가 없을 때(예: 백엔드 보안 필터가 CommonResponse 없이
 * 빈 403/401을 내려줄 때) HTTP status 기준으로 기본 메시지를 채운다.
 */
function defaultMessageForStatus(status?: number): string {
  switch (status) {
    case 400:
      return '잘못된 요청입니다. 입력값을 확인해주세요.';
    case 401:
    case 403:
      return '인증에 실패했거나 접근 권한이 없습니다.';
    case 404:
      return '요청한 정보를 찾을 수 없습니다.';
    case 500:
    case 502:
    case 503:
      return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
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
      const status = error.response?.status;
      const body = error.response?.data;
      throw new ApiError(
        body?.message ?? defaultMessageForStatus(status),
        body?.code,
        status
      );
    }
  );
}
