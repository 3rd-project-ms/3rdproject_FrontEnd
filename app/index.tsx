import { Redirect } from 'expo-router';
export default function Index() {
  // 앱이 켜지자마자 캐릭터 선택(home) 화면으로 자동 리다이렉트(이동)시킵니다.
  return <Redirect href="/(main)/home" />;
}
// 참고용 (나중에 로그인 연동 시 사용)
// export default function Index() {
//   const isLoggedIn = false; // 로그인 여부 체크 로직
//   if (!isLoggedIn) {
//     return <Redirect href="/(auth)/login" />;
//   }
//   return <Redirect href="/(main)/home" />;
// }
