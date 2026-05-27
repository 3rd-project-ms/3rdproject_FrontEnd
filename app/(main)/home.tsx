import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, Platform, ScrollView, Image, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_H } = Dimensions.get('window');

const CHARACTER_DATA = [
  {
    id: 1, name: '서태양', nameEn: 'Ian', age: '23세', role: '서핑 강사', affinity: 85,
    tags: ['#유죄인간', '#캘리포니아_바이브', '#인싸_서핑강사', '#은근한_소유욕'],
    desc: '능글맞은 미국 캘리포니아 찐친형 서핑 강사',
    stats: [
      { label: '능글 지수', value: 90 }, { label: '나른함', value: 70 },
      { label: '에너지', value: 80 },   { label: '체력',   value: 100 },
    ],
    image: require('../../assets/characters/ian.png'),
  },
  {
    id: 2, name: '유나', nameEn: 'Chloe', age: '23세', role: '서핑 강사', affinity: 42,
    tags: ['#왈가닥', '#솔직함', '#자각_후_뚝딱이'],
    desc: '자각 후 뚝딱거리는 퓨어 갭모에 소꿉친구',
    stats: [
      { label: '뚝딱 지수', value: 80 }, { label: '나른함', value: 20 },
      { label: '에너지',   value: 90 },  { label: '체력',   value: 100 },
    ],
    image: null,
  },
  {
    id: 3, name: '이하준', nameEn: 'June', age: '25세', role: '대학원 선배', affinity: 60,
    tags: ['#25세', '#츤데레', '#겉무속촉', '#호주_로컬', '#석사과정'],
    desc: '호주 교포 출신 츤데레 대학원 선배',
    stats: [
      { label: '츤데레 지수', value: 60 }, { label: '나른함', value: 80 },
      { label: '에너지',     value: 30 },  { label: '체력',   value: 50 },
    ],
    image: null,
  },
  {
    id: 4, name: '한윤서', nameEn: 'Yoon', age: '25세', role: '대학원 선배', affinity: 30,
    tags: ['#츤데레_걸크러시', '#겉무속촉', '#호주_로컬', '#고학번'],
    desc: '호주 교포 출신 츤데레 고학번 선배',
    stats: [
      { label: '츤데레 지수', value: 60 }, { label: '나른함', value: 80 },
      { label: '에너지',     value: 30 },  { label: '체력',   value: 50 },
    ],
    image: null,
  },
  {
    id: 5, name: '리암', nameEn: 'Liam', age: '29세', role: '카페 사장님', affinity: 75,
    tags: ['#다정다감', '#배려심_깊음', '#영국식_위트', '#성숙한_어른'],
    desc: '성숙하고 여유로운 영국 런던 어른 남자 사장님',
    stats: [
      { label: '다정 지수', value: 100 }, { label: '나른함', value: 60 },
      { label: '에너지',   value: 50 },   { label: '체력',   value: 70 },
    ],
    image: null,
  },
  {
    id: 6, name: '클로이', nameEn: 'Chloe', age: '29세', role: '카페 사장님', affinity: 50,
    tags: ['#사랑스러움', '#햇살같은_밝음', '#섬세한_배려', '#눈웃음'],
    desc: '주변을 밝히는 햇살 같고 다정한 사장님',
    stats: [
      { label: '다정 지수', value: 100 }, { label: '나른함', value: 10 },
      { label: '에너지',   value: 90 },   { label: '체력',   value: 60 },
    ],
    image: null,
  },
];

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={st.row}>
      <Text style={st.label}>{label}</Text>
      <View style={st.track}>
        <View style={[st.fill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label: { width: 70, fontSize: 12, fontWeight: '600', color: '#616161' },
  track: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' },
  fill:  { height: '100%', backgroundColor: '#2C3A5F', borderRadius: 3 },
});

export default function HomeScreen() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const char = CHARACTER_DATA[idx];

  const prev = () => setIdx((p) => (p === 0 ? CHARACTER_DATA.length - 1 : p - 1));
  const next = () => setIdx((p) => (p === CHARACTER_DATA.length - 1 ? 0 : p + 1));

  const goStage = () =>
    router.push({
      pathname: '/(main)/stage' as any,
      params: { name: char.name, role: char.role, affinity: char.affinity },
    });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.fullArea}>

        {/* 캐릭터 이미지 배치 배경 (뒤 실루엣 노출) */}
        <TouchableOpacity style={s.imageBg} activeOpacity={0.95} onPress={goStage}>
          {char.image ? (
            <Image source={char.image} style={s.charImage} resizeMode="cover" />
          ) : (
            <View style={s.placeholder}>
              <Ionicons name="person" size={100} color="#E0E0E0" />
            </View>
          )}
        </TouchableOpacity>

        {/* 헤더 바 */}
        <View style={s.header}>
          <Text style={s.logo}>LOGO</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/session-result' as any)} style={s.iconPad}>
            <Ionicons name="settings-outline" size={24} color="#0B0B12" />
          </TouchableOpacity>
        </View>

        {/* 좌우 화살표 */}
        <TouchableOpacity style={[s.arrow, s.arrowLeft]} onPress={prev}>
          <Ionicons name="chevron-back" size={28} color="#0B0B12" />
        </TouchableOpacity>
        <TouchableOpacity style={[s.arrow, s.arrowRight]} onPress={next}>
          <Ionicons name="chevron-forward" size={28} color="#0B0B12" />
        </TouchableOpacity>

        {/* 하단 투명 오버레이 카드 스택 조립 */}
        <View style={s.bottomStack}>

          {/* 1. 캐릭터 설명 카드 (불투명도 50% 적용 및 테두리 격파) */}
          <View style={s.card}>
            <Text style={s.charName}>
              {char.name} <Text style={s.charNameEn}>({char.nameEn})</Text>
            </Text>
            <Text style={s.charDesc}>{char.desc}</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.tagsRow}
            >
              {char.tags.map((tag) => (
                <View key={tag} style={s.tagChip}>
                  <Text style={s.tagTxt}>{tag}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={s.divider} />

            {char.stats.map((item) => (
              <StatBar key={item.label} label={item.label} value={item.value} />
            ))}
          </View>

          {/* 2. 나와의 호감도 카드 (설명 창 아래 안착 + 불투명도 50%) */}
          <View style={s.card}>
            <View style={s.affinityRow}>
              <Text style={s.affinityLabel}>나와의 호감도</Text>
              <Text style={s.affinityPct}>{char.affinity}%</Text>
            </View>
            <View style={s.affinityTrack}>
              <View style={[s.affinityFill, { width: `${char.affinity}%` }]} />
            </View>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  fullArea: { 
    flex: 1, 
    position: 'relative' 
  },
  imageBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
    backgroundColor: '#FFFFFF',
  },
  charImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 45 : 20,
    left: 20, right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  logo: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0B0B12',
    letterSpacing: -0.5
  },
  iconPad: {
    padding: 4,
  },
  arrow: {
    position: 'absolute',
    top: '38%',
    zIndex: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  arrowLeft:  { left: 12 },
  arrowRight: { right: 12 },
  bottomStack: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 16, right: 16,
    zIndex: 20,
    gap: 12, // 설명카드와 호감도카드 사이 간격 고정
  },

  // 💎 핵심 수정: 불투명도 50% 흰색 밸런싱 + 테두리 뭉개짐 오류 완벽 방어
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // 요청하신 정확한 반투명 50% 구현
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 0,          // 안드로이드 외곽선 자글거림 버그 차단
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 0,            // elevation과 투명층이 충돌하므로 순수 shadow 기법으로 안전 마감
  },
  charName: { 
    fontSize: 21, 
    fontWeight: '800', 
    color: '#0B0B12', 
    marginBottom: 4 
  },
  charNameEn: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#616161' 
  },
  charDesc: { 
    fontSize: 13.5, 
    color: '#616161', 
    fontWeight: '600', 
    marginBottom: 12, 
    lineHeight: 18 
  },
  tagsRow: { 
    flexDirection: 'row', 
    gap: 6, 
    marginBottom: 14 
  },
  tagChip: { 
    backgroundColor: 'rgba(44, 58, 95, 0.08)', // 딥네이비 소프트 투명칩 처리
    paddingVertical: 5, 
    paddingHorizontal: 11, 
    borderRadius: 20 
  },
  tagTxt: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#2C3A5F' 
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 14,
  },
  affinityRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  affinityLabel: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#0B0B12' 
  },
  affinityPct: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#2C3A5F' 
  },
  affinityTrack: { 
    height: 8, 
    backgroundColor: 'rgba(0, 0, 0, 0.06)', 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  affinityFill: { 
    height: '100%', 
    backgroundColor: '#F6A3A6', 
    borderRadius: 4 
  },
});