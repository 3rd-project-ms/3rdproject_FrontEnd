import { StyleSheet, View } from 'react-native';
import { Line, Polygon, Svg, Text as SvgText } from 'react-native-svg';

export interface RadarChartProps {
  data: {
    fluency: number;
    expression: number;
    grammar: number;
    task: number;
    vocabulary: number;
  };
  size?: number;
}

const LABELS = ['유창성', '표현력', '문법 정확도', '과제 수행도', '어휘력'];

export default function RadarChart({ data, size = 280 }: RadarChartProps) {
  const pad = 32;
  const svgSize = size + pad * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxRadius = size * 0.32;
  const labelRadius = maxRadius + 26;

  const values = [
    data.fluency,
    data.expression,
    data.grammar,
    data.task,
    data.vocabulary,
  ];

  const getAngleRad = (index: number) =>
    (index * 72 - 90) * (Math.PI / 180);

  const getPoint = (index: number, r: number) => {
    const a = getAngleRad(index);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const toPolygonStr = (pts: { x: number; y: number }[]) =>
    pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

  const bgPoints = [1, 0.5, 0.2].map(scale =>
    toPolygonStr(Array.from({ length: 5 }, (_, i) => getPoint(i, maxRadius * scale)))
  );

  const dataPoints = toPolygonStr(
    values.map((v, i) => getPoint(i, maxRadius * Math.max(0, Math.min(1, v))))
  );

  const getLabelProps = (index: number) => {
    const angleDeg = index * 72 - 90;
    const a = angleDeg * (Math.PI / 180);
    const x = cx + labelRadius * Math.cos(a);
    const y = cy + labelRadius * Math.sin(a);

    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    if (angleDeg > -60 && angleDeg < 60) textAnchor = 'start';
    else if (angleDeg > 120 || angleDeg < -120) textAnchor = 'end';

    return { x, y, textAnchor };
  };

  return (
    <View style={[styles.container, { width: svgSize, height: svgSize }]}>
      <Svg width={svgSize} height={svgSize}>
        {/* 배경 오각형 3단계 */}
        {bgPoints.map((pts, idx) => (
          <Polygon
            key={idx}
            points={pts}
            fill={idx === 0 ? '#2A2A2A' : 'none'}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />
        ))}

        {/* 축 선 */}
        {Array.from({ length: 5 }, (_, i) => {
          const end = getPoint(i, maxRadius);
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            />
          );
        })}

        {/* 데이터 오각형 */}
        <Polygon
          points={dataPoints}
          fill="rgba(244,63,94,0.2)"
          stroke="#F43F5E"
          strokeWidth={2}
        />

        {/* 축 라벨 */}
        {LABELS.map((label, i) => {
          const { x, y, textAnchor } = getLabelProps(i);
          return (
            <SvgText
              key={i}
              x={x}
              y={y}
              fontSize={12}
              fill="#BBBBBB"
              textAnchor={textAnchor}
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
});
