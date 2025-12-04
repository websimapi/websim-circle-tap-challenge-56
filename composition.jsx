import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Audio, Img, spring, useVideoConfig, Sequence } from "remotion";
import * as THREE from "three";
const StarfieldBackground = () => {
  const canvasRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const cameraRef = React.useRef(null);
  const rendererRef = React.useRef(null);
  const starsRef = React.useRef(null);
  React.useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(60, 540 / 960, 1, 1e3);
    camera.position.z = 1;
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(540, 960);
    renderer.setPixelRatio(1);
    renderer.setClearColor(1710638, 1);
    rendererRef.current = renderer;
    const starCount = 8e3;
    const starVertices = [];
    const starVelocities = [];
    const starSizes = [];
    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 2e3;
      const y = (Math.random() - 0.5) * 2e3;
      const z = Math.random() * -2e3;
      starVertices.push(x, y, z);
      starVelocities.push(0, 0, 0.5 + Math.random() * 1);
      starSizes.push(1 + Math.random() * 2);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute("velocity", new THREE.Float32BufferAttribute(starVelocities, 3));
    starGeometry.setAttribute("size", new THREE.Float32BufferAttribute(starSizes, 1));
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(16777215) }
      },
      vertexShader: `
                attribute float size;
                attribute vec3 velocity;
                varying float vAlpha;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                    vAlpha = 1.0 - (abs(position.z) / 1000.0);
                }
            `,
      fragmentShader: `
                uniform vec3 color;
                varying float vAlpha;
                void main() {
                    float r = 0.0, delta = 0.0, alpha = 1.0;
                    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                    r = dot(cxy, cxy);
                    if (r > 1.0) {
                        discard;
                    }
                    gl_FragColor = vec4(color, vAlpha * (1.0 - r));
                }
            `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;
    return () => {
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
    };
  }, []);
  const frame = useCurrentFrame();
  React.useEffect(() => {
    if (!starsRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    const stars = starsRef.current;
    const positions = stars.geometry.attributes.position.array;
    const velocities = stars.geometry.attributes.velocity.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += velocities[i + 2] * 2;
      if (positions[i + 2] > cameraRef.current.position.z) {
        positions[i] = (Math.random() - 0.5) * 2e3;
        positions[i + 1] = (Math.random() - 0.5) * 2e3;
        positions[i + 2] = -2e3;
      }
    }
    stars.geometry.attributes.position.needsUpdate = true;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [frame]);
  return /* @__PURE__ */ jsxDEV(
    "canvas",
    {
      ref: canvasRef,
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0
      }
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 123,
      columnNumber: 9
    }
  );
};
const Visualizer = ({ pulseAmount, targetColor, radius, lineWidth }) => {
  if (!pulseAmount || pulseAmount <= 0.1) {
    return null;
  }
  const outerRadius = radius + lineWidth / 2;
  const innerRadius = radius - lineWidth / 2;
  const maxOuterPulse = lineWidth * 0.8;
  const pulseOuterRadius = outerRadius + pulseAmount * maxOuterPulse;
  const maxInnerPulse = innerRadius * 0.7;
  const pulseInnerRadius = innerRadius - pulseAmount * maxInnerPulse;
  const pulseColorRgba = targetColor.replace("hsl", "hsla").replace(")", `, ${pulseAmount * 0.3})`);
  const outerGradientId = `outerPulseGradient-${Math.random()}`;
  const innerGradientId = `innerPulseGradient-${Math.random()}`;
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("defs", { children: [
      /* @__PURE__ */ jsxDEV("radialGradient", { id: outerGradientId, cx: "0", cy: "0", r: pulseOuterRadius, gradientUnits: "userSpaceOnUse", children: [
        /* @__PURE__ */ jsxDEV("stop", { offset: 0, stopColor: "rgba(0,0,0,0)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 160,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("stop", { offset: `${outerRadius / pulseOuterRadius * 0.8}`, stopColor: "rgba(0,0,0,0)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 161,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("stop", { offset: `${outerRadius / pulseOuterRadius * 0.95}`, stopColor: pulseColorRgba }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 162,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("stop", { offset: "1", stopColor: "rgba(0,0,0,0)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 163,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 159,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("radialGradient", { id: innerGradientId, cx: "0", cy: "0", r: innerRadius, gradientUnits: "userSpaceOnUse", children: [
        /* @__PURE__ */ jsxDEV("stop", { offset: 0, stopColor: "rgba(0,0,0,0)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 166,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("stop", { offset: `${pulseInnerRadius / innerRadius}`, stopColor: "rgba(0,0,0,0)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 167,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("stop", { offset: `${pulseInnerRadius / innerRadius * 1.25}`, stopColor: pulseColorRgba }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 168,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("stop", { offset: "1", stopColor: "rgba(0,0,0,0)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 169,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 165,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 158,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("rect", { x: "-55", y: "-55", width: "110", height: "110", fill: `url(#${outerGradientId})` }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 172,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("rect", { x: "-55", y: "-55", width: "110", height: "110", fill: `url(#${innerGradientId})` }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 173,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 157,
    columnNumber: 9
  });
};
const GameCanvas = ({ frameData, config }) => {
  const { angle, targetStartAngle, targetSize, success, fail, targetColor, pulseAmount } = frameData;
  const { difficulty, difficulties, colors } = config;
  const { trackWidthFactor } = difficulties[difficulty];
  const radius = 45;
  const lineWidth = radius * 2 * trackWidthFactor;
  return /* @__PURE__ */ jsxDEV("svg", { viewBox: "-55 -55 110 110", style: { width: "100%", height: "100%" }, children: [
    /* @__PURE__ */ jsxDEV(Visualizer, { pulseAmount, targetColor, radius, lineWidth }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 188,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(
      "circle",
      {
        cx: "0",
        cy: "0",
        r: radius,
        fill: "none",
        stroke: colors.secondary,
        strokeWidth: lineWidth,
        strokeLinecap: "butt"
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 190,
        columnNumber: 13
      }
    ),
    targetSize > 0 && /* @__PURE__ */ jsxDEV(
      "path",
      {
        d: `M ${radius * Math.cos(targetStartAngle)} ${radius * Math.sin(targetStartAngle)} A ${radius} ${radius} 0 0 1 ${radius * Math.cos(targetStartAngle + targetSize)} ${radius * Math.sin(targetStartAngle + targetSize)}`,
        fill: "none",
        stroke: targetColor || colors.success,
        strokeWidth: lineWidth * 0.95,
        strokeLinecap: "round"
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 199,
        columnNumber: 17
      }
    ),
    /* @__PURE__ */ jsxDEV("g", { transform: `rotate(${angle * 180 / Math.PI + 90})`, children: /* @__PURE__ */ jsxDEV(
      "line",
      {
        x1: "0",
        y1: -(radius - lineWidth / 2),
        x2: "0",
        y2: -(radius + lineWidth / 2),
        stroke: colors.fail,
        strokeWidth: lineWidth / 2.5,
        strokeLinecap: "butt"
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 209,
        columnNumber: 17
      }
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 208,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 187,
    columnNumber: 9
  });
};
const LevelDisplay = ({ level, isVisible }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = isVisible ? spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 150
    }
  }) : 0;
  const opacity = isVisible ? interpolate(frame, [0, 15], [0, 0.5]) : 0;
  return /* @__PURE__ */ jsxDEV("div", { style: {
    position: "absolute",
    fontSize: "8rem",
    fontWeight: "bold",
    color: "rgba(220, 220, 220, 0.5)",
    textShadow: "0 0 10px rgba(0,0,0,0.5)",
    opacity,
    transform: `scale(${scale})`,
    zIndex: 1
  }, children: level }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 237,
    columnNumber: 9
  });
};
const Avatar = ({ user, prefetchedAvatarUrl }) => {
  if (!prefetchedAvatarUrl) {
    return /* @__PURE__ */ jsxDEV("div", { style: { width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "#4a4a6a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold" }, children: user ? user.username.charAt(0).toUpperCase() : "?" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 255,
      columnNumber: 13
    });
  }
  return /* @__PURE__ */ jsxDEV(
    Img,
    {
      src: prefetchedAvatarUrl,
      style: { width: "50px", height: "50px", borderRadius: "50%" }
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 262,
      columnNumber: 9
    }
  );
};
const EndScreenOverlay = ({ score, level, user, isGameOver, prefetchedAvatarUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scaleIn = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 150
    }
  });
  const opacity = interpolate(frame, [0, 15], [0, 1]);
  const finalScoreText = `Final Score: ${score}`;
  const finalLevelText = `Level: ${level}`;
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { padding: "20px", fontFamily: "Arial, sans-serif", color: "white", opacity }, children: [
    user && /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", top: "20px", left: "20px", display: "flex", alignItems: "center", gap: "10px", transform: `scale(${scaleIn})` }, children: [
      /* @__PURE__ */ jsxDEV(Avatar, { user, prefetchedAvatarUrl }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 292,
        columnNumber: 21
      }),
      /* @__PURE__ */ jsxDEV("span", { style: { fontSize: "24px", fontWeight: "bold", textShadow: "2px 2px 4px #000" }, children: user.username }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 293,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 291,
      columnNumber: 18
    }),
    /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", top: "30px", right: "20px", fontSize: "24px", fontWeight: "bold", textShadow: "2px 2px 4px #000", transform: `scale(${scaleIn})`, textAlign: "right" }, children: [
      /* @__PURE__ */ jsxDEV("div", { children: finalScoreText }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 300,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { children: finalLevelText }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 301,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 299,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 288,
    columnNumber: 9
  });
};
const ReplayComposition = ({ replayData, prefetchedAvatarUrl }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  if (!replayData || !replayData.frames || replayData.frames.length < 2) {
    return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "#1a1a2e", color: "white", justifyContent: "center", alignItems: "center" }, children: "Loading replay..." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 312,
      columnNumber: 16
    });
  }
  const { frames, config } = replayData;
  const { currentUser } = config;
  const startTime = frames[0].timestamp;
  const gameEndTime = frames[frames.length - 1].timestamp;
  const gameEndFrame = Math.ceil((gameEndTime - startTime) / 1e3 * 30);
  const currentTimestamp = startTime + frame / 30 * 1e3;
  let frameIndex;
  if (frame < gameEndFrame) {
    frameIndex = frames.findIndex((f) => f.timestamp >= currentTimestamp);
    if (frameIndex === -1) frameIndex = frames.length - 1;
  } else {
    frameIndex = frames.length - 1;
  }
  const currentFrameData = frames[frameIndex];
  const score = currentFrameData.score;
  const level = currentFrameData.level || 1;
  const isGameOver = frameIndex === frames.length - 1 && !currentFrameData.success;
  const showEndScreen = frame >= gameEndFrame;
  const isDuringEndScreen = frame >= gameEndFrame && frame < gameEndFrame + 90;
  const successFrames = frames.filter((f) => f.success);
  const MAX_VOLUME = 0.3;
  const FADE_DURATION_FRAMES = 15 * fps;
  let musicVolume;
  if (durationInFrames <= 2 * FADE_DURATION_FRAMES) {
    const midPoint = durationInFrames / 2;
    musicVolume = interpolate(
      frame,
      [0, midPoint, durationInFrames],
      [0, MAX_VOLUME, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  } else {
    musicVolume = interpolate(
      frame,
      [0, FADE_DURATION_FRAMES, durationInFrames - FADE_DURATION_FRAMES, durationInFrames],
      [0, MAX_VOLUME, MAX_VOLUME, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  }
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "#1a1a2e" }, children: [
    /* @__PURE__ */ jsxDEV(StarfieldBackground, {}, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 370,
      columnNumber: 13
    }),
    !showEndScreen && /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { top: "5vh", justifyContent: "flex-start", alignItems: "center" }, children: /* @__PURE__ */ jsxDEV("div", { style: { fontSize: "clamp(1.5rem, 5vw, 2.5rem)", fontWeight: "bold", color: config.colors.fail.trim(), fontFamily: "Arial, sans-serif" }, children: [
      "Score: ",
      score
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 375,
      columnNumber: 21
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 374,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { justifyContent: "center", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxDEV(LevelDisplay, { level, isVisible: !showEndScreen || isDuringEndScreen }, `level-${level}`, false, {
        fileName: "<stdin>",
        lineNumber: 383,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { style: { width: "90%", height: "auto", aspectRatio: "1 / 1" }, children: /* @__PURE__ */ jsxDEV(GameCanvas, { frameData: currentFrameData, config }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 385,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 384,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 382,
      columnNumber: 13
    }),
    showEndScreen && /* @__PURE__ */ jsxDEV(EndScreenOverlay, { score, level, user: currentUser, isGameOver, prefetchedAvatarUrl }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 390,
      columnNumber: 32
    }),
    /* @__PURE__ */ jsxDEV(Audio, { src: "/Infinite Orbit - Track 1 (Extended 2) - Sonauto.ogg", volume: musicVolume, loop: true }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 393,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(Audio, { src: "/start_sound.mp3", volume: 0.5 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 394,
      columnNumber: 13
    }),
    successFrames.map((f, i) => {
      const frameForAudio = Math.round((f.timestamp - startTime) / 1e3 * 30);
      if (frameForAudio < gameEndFrame) {
        return /* @__PURE__ */ jsxDEV(Sequence, { from: frameForAudio, children: /* @__PURE__ */ jsxDEV(Audio, { src: "/success.mp3" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 402,
          columnNumber: 25
        }) }, `success-${i}`, false, {
          fileName: "<stdin>",
          lineNumber: 401,
          columnNumber: 22
        });
      }
      return null;
    }),
    isGameOver && /* @__PURE__ */ jsxDEV(Sequence, { from: gameEndFrame - 1, children: /* @__PURE__ */ jsxDEV(Audio, { src: "/fail.mp3" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 411,
      columnNumber: 21
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 410,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 369,
    columnNumber: 9
  });
};
export {
  ReplayComposition
};
