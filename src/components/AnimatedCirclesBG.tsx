// import React, { useEffect } from "react";
// import { StyleSheet, useWindowDimensions } from "react-native";
// import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from "react-native-svg";
// import Animated, {
//   Easing,
//   useSharedValue,
//   withRepeat,
//   withTiming,
//   useAnimatedProps,
// } from "react-native-reanimated";

// const ACircle = Animated.createAnimatedComponent(Circle);

// type CircleItem = {
//   id: string;
//   cx: number;
//   cy: number;
//   r: number;
//   fill: string; // color or gradient url(#id)
//   opacity?: number;
//   dx: number; // how far to move on X
//   dy: number; // how far to move on Y
//   dur: number; // duration ms
// };

// export default function AnimatedCirclesBG() {
//   const { width, height } = useWindowDimensions();

//   // base design size (for responsive scaling)
//   const VB_W = 393;
//   const VB_H = 852;

//   // Animation progress values per circle
//   const p1 = useSharedValue(0);
//   const p2 = useSharedValue(0);
//   const p3 = useSharedValue(0);
//   const p4 = useSharedValue(0);
//   const p5 = useSharedValue(0);
//   const p6 = useSharedValue(0);
//   const p7 = useSharedValue(0);
//   const p8 = useSharedValue(0);
//   const p9 = useSharedValue(0);

//   useEffect(() => {
//     const make = (sv: any, dur: number, delay = 0) => {
//       sv.value = withRepeat(
//         withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }),
//         -1,
//         true
//       );
//     };

//     make(p1, 3000);
//     make(p2, 4000);
//     make(p3, 5000);
//     make(p4, 6000);
//     make(p5, 3500);
//     make(p6, 6000);
//     make(p7, 9000);
//     make(p8, 2000);
//     make(p9, 7500);
//   }, []);

//   const circles: Array<CircleItem & { prog: any }> = [
//     { id: "c1", cx: 70,  cy: 80,  r: 150, fill: "url(#c1)", dx: 70,  dy: 80,  dur: 7000, opacity: 1, prog: p1 },
//     { id: "c2", cx: 300, cy: 120, r: 155, fill: "url(#c2)", dx: 90, dy: 12,  dur: 9000, opacity: 1, prog: p2 },
//     { id: "c3", cx: 85,  cy: 250, r: 90,  fill: "#5fa9b7",   dx: 10,  dy: -12, dur: 8000, opacity: 0.9, prog: p3 },
//     { id: "c4", cx: 280, cy: 360, r: 135, fill: "url(#c3)", dx: 14,  dy: -10, dur: 10000, opacity: 1, prog: p4 },
//     { id: "c5", cx: 330, cy: 280, r: 45,  fill: "#6aaebb",   dx: -10, dy: 10,  dur: 6500, opacity: 0.9, prog: p5 },
//     { id: "c6", cx: 80,  cy: 470, r: 130, fill: "url(#c4)", dx: 20,  dy: 16,  dur: 11000, opacity: 0.95, prog: p6 },
//     { id: "c7", cx: 305, cy: 520, r: 135, fill: "#2f8ca1",   dx: -18, dy: -14, dur: 9500, opacity: 0.9, prog: p7 },
//     { id: "c8", cx: 70,  cy: 740, r: 160, fill: "url(#c4)", dx: 16,  dy: -18, dur: 12000, opacity: 1, prog: p8 },
//     { id: "c9", cx: 290, cy: 770, r: 165, fill: "url(#c5)", dx: -14, dy: 12,  dur: 7500, opacity: 1, prog: p9 },
//   ];

//   return (
//     <Animated.View style={styles.container}>
//       <Svg
//         width={width}
//         height={height}
//         viewBox={`0 0 ${VB_W} ${VB_H}`}
//         preserveAspectRatio="xMidYMid slice"
//         style={StyleSheet.absoluteFill}
//       >
//         <Defs>
//           <RadialGradient id="bg" cx="50%" cy="40%" r="80%">
//             <Stop offset="0%" stopColor="#bfe8ef" stopOpacity="1" />
//             <Stop offset="60%" stopColor="#63c3d3" stopOpacity="1" />
//             <Stop offset="100%" stopColor="#39b8c5" stopOpacity="1" />
//           </RadialGradient>

//           <RadialGradient id="c1" cx="35%" cy="35%" r="70%">
//             <Stop offset="0%" stopColor="#6fe0e6" stopOpacity="1" />
//             <Stop offset="100%" stopColor="#4dc8d2" stopOpacity="1" />
//           </RadialGradient>

//           <RadialGradient id="c2" cx="40%" cy="35%" r="75%">
//             <Stop offset="0%" stopColor="#7fd0dc" stopOpacity="1" />
//             <Stop offset="100%" stopColor="#5fbfd0" stopOpacity="1" />
//           </RadialGradient>

//           <RadialGradient id="c3" cx="40%" cy="40%" r="80%">
//             <Stop offset="0%" stopColor="#0b8aa1" stopOpacity="1" />
//             <Stop offset="100%" stopColor="#0a6f88" stopOpacity="1" />
//           </RadialGradient>

//           <RadialGradient id="c4" cx="50%" cy="50%" r="75%">
//             <Stop offset="0%" stopColor="#3bcad4" stopOpacity="1" />
//             <Stop offset="100%" stopColor="#22b9c6" stopOpacity="1" />
//           </RadialGradient>

//           <RadialGradient id="c5" cx="45%" cy="45%" r="80%">
//             <Stop offset="0%" stopColor="#64c7d8" stopOpacity="1" />
//             <Stop offset="100%" stopColor="#4ab9cf" stopOpacity="1" />
//           </RadialGradient>
//         </Defs>

//         {/* Base Background */}
//         <Rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#bg)" />

//         {/* Animated circles */}
//         {circles.map((c) => {
//           const animatedProps = useAnimatedProps(() => {
//             // oscillation 0..1, convert to -1..1
//             const t = c.prog.value * 2 - 1;
//             return {
//               cx: c.cx + t * c.dx,
//               cy: c.cy + t * c.dy,
//             };
//           });

//           return (
//             <ACircle
//               key={c.id}
//               animatedProps={animatedProps}
//               r={c.r}
//               fill={c.fill}
//               opacity={c.opacity ?? 1}
//             />
//           );
//         })}
//       </Svg>
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
// });

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, Pressable, View } from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import Animated, {
  Easing,
  useSharedValue,
  withSequence,
  withTiming,
  useAnimatedProps,
  interpolate,
  Extrapolate,
  withSpring,
  withDelay,
  withRepeat,
  useAnimatedStyle,
} from 'react-native-reanimated';

const ACircle = Animated.createAnimatedComponent(Circle);

type CircleDef = {
  id: string;
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity?: number;
};

function AnimatedCircle({
  cx,
  cy,
  r,
  fill,
  opacity,
  centerX,
  centerY,
  progress,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity?: number;
  centerX: number;
  centerY: number;
  progress: any;
}) {
  //   const animatedProps = useAnimatedProps(() => {
  //     // progress: 0 -> 1
  //     // phase1: 0..0.45 => move to center
  //     // phase2: 0.45..1 => move from center to offscreen
  //     const x1 = interpolate(
  //       progress.value,
  //       [0, 0.45],
  //       [cx, centerX],
  //       Extrapolate.CLAMP,
  //     );
  //     const y1 = interpolate(
  //       progress.value,
  //       [0, 0.45],
  //       [cy, centerY],
  //       Extrapolate.CLAMP,
  //     );

  //     const x2 = interpolate(
  //       progress.value,
  //       [0.45, 1],
  //       [centerX, ex],
  //       Extrapolate.CLAMP,
  //     );
  //     const y2 = interpolate(
  //       progress.value,
  //       [0.45, 1],
  //       [centerY, ey],
  //       Extrapolate.CLAMP,
  //     );

  //     return {
  //       cx: progress.value <= 0.45 ? x1 : x2,
  //       cy: progress.value <= 0.45 ? y1 : y2,
  //     };
  //   });

  //   return (
  //     <ACircle
  //       animatedProps={animatedProps}
  //       r={r}
  //       fill={fill}
  //       opacity={opacity ?? 1}
  //     />
  //   );
  // }

  const animatedProps = useAnimatedProps(() => {
    // start vector from center to circle
    const vx = cx - centerX;
    const vy = cy - centerY;

    // opposite direction (go away on the other side)
    const factor = 5.5; // 🔥 increase = further off-screen (try 4 to 7)
    const outX = centerX - vx * factor;
    const outY = centerY - vy * factor;

    // // Phase1: 0..0.45 => start -> center
    // const xToCenter = interpolate(
    //   progress.value,
    //   [0, 0.45],
    //   [cx, centerX],
    //   Extrapolate.CLAMP,
    // );
    // const yToCenter = interpolate(
    //   progress.value,
    //   [0, 0.45],
    //   [cy, centerY],
    //   Extrapolate.CLAMP,
    // );

    // // Phase2: 0.45..1 => center -> opposite out
    // const xOut = interpolate(
    //   progress.value,
    //   [0.45, 1],
    //   [centerX, outX],
    //   Extrapolate.CLAMP,
    // );
    // const yOut = interpolate(
    //   progress.value,
    //   [0.45, 1],
    //   [centerY, outY],
    //   Extrapolate.CLAMP,
    // );

    // how much "reverse/anticipation" you want (0.12 - 0.25 good)
    const reverseAmount = 0.18;

    // Phase1: -0.08..0.45 => (reverse a bit) -> center
    const xToCenter = interpolate(
      progress.value,
      [-0.08, 0.45],
      [cx + vx * reverseAmount, centerX],
      Extrapolate.CLAMP,
    );

    const yToCenter = interpolate(
      progress.value,
      [-0.08, 0.45],
      [cy + vy * reverseAmount, centerY],
      Extrapolate.CLAMP,
    );

    // Phase2: 0.45..1 => center -> opposite out
    const xOut = interpolate(
      progress.value,
      [0.45, 1],
      [centerX, outX],
      Extrapolate.CLAMP,
    );

    const yOut = interpolate(
      progress.value,
      [0.45, 1],
      [centerY, outY],
      Extrapolate.CLAMP,
    );

    return {
      cx: progress.value <= 0.45 ? xToCenter : xOut,
      cy: progress.value <= 0.45 ? yToCenter : yOut,
    };
  });

  return (
    <ACircle
      animatedProps={animatedProps}
      r={r}
      fill={fill}
      opacity={opacity ?? 1}
    />
  );
}

export default function AnimatedCirclesBG() {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(0.8);
  const imageOpacity = useSharedValue(0);

  // Design viewBox (same as before)
  const VB_W = 393;
  const VB_H = 852;

  // Center point in viewBox coordinates
  const centerX = VB_W / 2;
  const centerY = VB_H / 2;

  // ONE shared progress for all circles (tap to run)
  const progress = useSharedValue(0);

  const circles: CircleDef[] = useMemo(
    () => [
      // ex/ey ko offscreen rakha hai (viewBox se bahar)
      {
        id: 'c1',
        cx: 70,
        cy: 80,
        r: 150,
        fill: 'url(#c1)',
        opacity: 1,
      },
      {
        id: 'c2',
        cx: 300,
        cy: 120,
        r: 155,
        fill: 'url(#c2)',
        opacity: 1,
      },
      {
        id: 'c3',
        cx: 85,
        cy: 250,
        r: 90,
        fill: '#5fa9b7',
        opacity: 0.9,
      },
      {
        id: 'c4',
        cx: 280,
        cy: 360,
        r: 135,
        fill: 'url(#c3)',
        opacity: 1,
      },
      {
        id: 'c5',
        cx: 330,
        cy: 280,
        r: 45,
        fill: '#6aaebb',
        opacity: 0.9,
      },
      {
        id: 'c6',
        cx: 80,
        cy: 470,
        r: 130,
        fill: 'url(#c4)',
        opacity: 0.95,
      },
      {
        id: 'c7',
        cx: 305,
        cy: 520,
        r: 135,
        fill: '#2f8ca1',
        opacity: 0.9,
      },
      {
        id: 'c8',
        cx: 70,
        cy: 740,
        r: 160,
        fill: 'url(#c4)',
        opacity: 1,
      },
      {
        id: 'c9',
        cx: 290,
        cy: 770,
        r: 165,
        fill: 'url(#c5)',
        opacity: 1,
      },
    ],
    [],
  );

  useEffect(() => {
    runOnce();

    scale.value = withRepeat(
      withTiming(1.1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const runOnce = () => {
    progress.value = 0;

    imageOpacity.value = 0;

    imageOpacity.value = withDelay(
      3000,
      withTiming(1, { duration: 400, easing: Easing.linear }),
    );

    progress.value = withDelay(
      1000,
      withSequence(
        // ✅ slight reverse (anticipation)
        // withTiming(-0.08, { duration: 500, easing: Easing.out(Easing.quad) }),
        // withTiming(0.45, { duration: 1500, easing: Easing.out(Easing.cubic) }), // gather
        // withTiming(1, { duration: 1000, easing: Easing.in(Easing.cubic) }), // exit opposite
        withTiming(-0.08, { duration: 500, easing: Easing.linear }),
        withTiming(0.45, { duration: 1500, easing: Easing.linear }), // gather
        withTiming(1, { duration: 1000, easing: Easing.linear }), // exit opposite
      ),
    );
  };

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: imageOpacity.value,
  }));

  return (
    <Pressable style={styles.container} onPress={runOnce}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="40%" r="80%">
            <Stop offset="0%" stopColor="#bfe8ef" stopOpacity="1" />
            <Stop offset="60%" stopColor="#63c3d3" stopOpacity="1" />
            <Stop offset="100%" stopColor="#39b8c5" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="c1" cx="35%" cy="35%" r="70%">
            <Stop offset="0%" stopColor="#6fe0e6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#4dc8d2" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="c2" cx="40%" cy="35%" r="75%">
            <Stop offset="0%" stopColor="#7fd0dc" stopOpacity="1" />
            <Stop offset="100%" stopColor="#5fbfd0" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="c3" cx="40%" cy="40%" r="80%">
            <Stop offset="0%" stopColor="#0b8aa1" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0a6f88" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="c4" cx="50%" cy="50%" r="75%">
            <Stop offset="0%" stopColor="#3bcad4" stopOpacity="1" />
            <Stop offset="100%" stopColor="#22b9c6" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="c5" cx="45%" cy="45%" r="80%">
            <Stop offset="0%" stopColor="#64c7d8" stopOpacity="1" />
            <Stop offset="100%" stopColor="#4ab9cf" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Base Background */}
        {/* <Rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#bg)" /> */}
        <Rect x="0" y="0" width={VB_W} height={VB_H} fill="#ffffff" />

        {/* Circles: center touch then exit */}
        {circles.map(c => (
          <AnimatedCircle
            key={c.id}
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            fill={c.fill}
            opacity={c.opacity}
            centerX={centerX}
            centerY={centerY}
            progress={progress}
          />
        ))}
      </Svg>

      <Animated.Image
        source={require('../../assets/images/policy.png')}
        style={[styles.centerImage, imageStyle]}
        resizeMode="contain"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerImage: {
    position: 'absolute',
    width: '90%', // adjust size
    // height: '40%',
  },
});
