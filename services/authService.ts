// services/authService.ts
// 로그인 / 회원가입 / 게스트 로그인 API
// 주의: 백엔드는 JWT 토큰을 발급하지 않고 user_id 기반으로 동작한다.
//       로그인/회원가입 성공 후 받은 user_id를 저장해 이후 요청에 사용한다.
import { api, unwrap, CommonResponse } from './api';

// ── 요청/응답 타입 (swagger 기준, snake_case) ──
export type PartnerGender = 'male' | 'female';

export interface SignupRequest {
  login_id: string;
  password: string;
  nickname: string;
  preferred_partner_gender: PartnerGender;
}

export interface SignupResponse {
  user_id: number;
  login_id: string;
  nickname: string;
}

export interface LoginRequest {
  login_id: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  nickname: string;
  continuous_days?: number;
}

export interface GuestLoginResponse {
  user_id: number;
  nickname: string;
  current_level: string;
  continuous_days: number;
  is_new_user: boolean;
}

export const authService = {
  /** 회원가입 */
  signup: (req: SignupRequest): Promise<SignupResponse> =>
    unwrap(api.post<CommonResponse<SignupResponse>>('/api/auth/signup', req)),

  /** 로그인 */
  login: (req: LoginRequest): Promise<LoginResponse> =>
    unwrap(api.post<CommonResponse<LoginResponse>>('/api/auth/login', req)),

  /** 게스트 로그인 */
  guestLogin: (guestId: string): Promise<GuestLoginResponse> =>
    unwrap(
      api.post<CommonResponse<GuestLoginResponse>>('/api/auth/guest', {
        guest_id: guestId,
      })
    ),
};
