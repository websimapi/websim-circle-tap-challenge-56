import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@websim/remotion/player";
import { ReplayComposition } from "./composition.jsx";
const rootElement = document.getElementById("player-root");
const root = createRoot(rootElement);
let replayData = null;
const RenderApp = ({ children }) => {
  React.useEffect(() => {
    const hiddenElements = /* @__PURE__ */ new Set();
    const cleanupInjectedUI = () => {
      const root2 = document.getElementById("player-root");
      if (!root2) return;
      Array.from(document.body.children).forEach((child) => {
        if (child.tagName === "DIV" && child !== root2 && !child.contains(root2)) {
          if (child.style.display !== "none") {
            child.style.display = "none";
            hiddenElements.add(child);
          }
        }
      });
    };
    cleanupInjectedUI();
    const interval = setInterval(cleanupInjectedUI, 200);
    return () => {
      clearInterval(interval);
      hiddenElements.forEach((el) => el.style.display = "");
    };
  }, []);
  return /* @__PURE__ */ jsxDEV(Fragment, { children }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 43,
    columnNumber: 12
  });
};
const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
const prefetchAvatar = async (user) => {
  if (!user || !user.avatar_url) {
    return null;
  }
  const originalUrl = user.avatar_url;
  const sources = [
    `https://api.cors.lol/?url=${encodeURIComponent(originalUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(originalUrl)}`,
    `https://api.everyorigin.workers.dev/raw?url=${encodeURIComponent(originalUrl)}`,
    originalUrl
  ];
  for (const source of sources) {
    try {
      const response = await fetch(source, { mode: "cors" });
      if (response.ok) {
        const blob = await response.blob();
        if (blob.type.startsWith("image/")) {
          return await blobToDataURL(blob);
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch avatar from ${source}`, e);
    }
  }
  return null;
};
const renderPlayer = async (data) => {
  if (!data || !data.frames || data.frames.length === 0) {
    console.error("No replay data to render");
    return;
  }
  const prefetchedAvatarUrl = data.config && data.config.currentUser ? await prefetchAvatar(data.config.currentUser) : null;
  const durationInSeconds = (data.frames[data.frames.length - 1].timestamp - data.frames[0].timestamp) / 1e3;
  const durationInFrames = Math.ceil(durationInSeconds * 30) + 90;
  root.render(
    /* @__PURE__ */ jsxDEV(RenderApp, { children: /* @__PURE__ */ jsxDEV(
      Player,
      {
        component: ReplayComposition,
        durationInFrames,
        fps: 30,
        compositionWidth: 540,
        compositionHeight: 960,
        loop: true,
        controls: true,
        autoplay: true,
        inputProps: { replayData: data, prefetchedAvatarUrl },
        style: { width: "100%", height: "100%" },
        numberOfSharedAudioTags: 100
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 97,
        columnNumber: 9
      }
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 96,
      columnNumber: 7
    })
  );
};
window.addEventListener("showReplay", (e) => {
  replayData = e.detail;
  renderPlayer(replayData);
});
window.addEventListener("hideReplay", () => {
  root.render(null);
});
