document.addEventListener("keydown", (event) => {
  // Check if Alt key is pressed and a number key (0-9) is hit
  if (event.altKey && event.key >= "0" && event.key <= "9") {
    // Calculate speed: Alt+0 = 1x, Alt+1 = 1.25x ... Alt+9 = 3.25x
    const speed = 1 + 0.25 * parseInt(event.key, 10);

    // Use a helper function to find ALL videos, including those deep in Shadow DOMs
    const videos = queryAllVideos(document);

    if (videos.length > 0) {
      videos.forEach((video) => {
        video.playbackRate = speed;
      });

      console.log(`Speed set to ${speed}x for ${videos.length} video(s).`);
      showToast(speed);
    } else {
      console.log("No video elements found on this page (or frame).");
    }
  }
});

// Helper: recursively searches for video tags inside Shadow DOMs
function queryAllVideos(root) {
  let videos = [];

  // 1. Get videos in the current root
  if (root.querySelectorAll) {
    const standardVideos = root.querySelectorAll("video");
    videos = [...videos, ...standardVideos];
  }

  // 2. Traverse all children to look for Shadow Roots
  // We use a tree walker or simple loop. Here is a robust loop approach:
  const allElements = root.querySelectorAll ? root.querySelectorAll("*") : [];

  for (let el of allElements) {
    if (el.shadowRoot) {
      // Recursively search inside the shadow root
      videos = [...videos, ...queryAllVideos(el.shadowRoot)];
    }
  }

  return videos;
}

// Visual feedback helper
function showToast(speed) {
  // Check if we are in an iframe; if so, try to show toast in the top window if possible,
  // otherwise show in the frame.
  let toast = document.getElementById("universal-speed-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "universal-speed-toast";
    // High z-index is crucial for fullscreen players
    toast.style.cssText =
      "position:fixed; top:20px; right:20px; z-index:2147483647; background:rgba(0,0,0,0.8); color:white; padding:12px 24px; border-radius:8px; font-family:sans-serif; font-size:24px; font-weight:bold; pointer-events:none; transition: opacity 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";
    document.body.appendChild(toast);
  }

  toast.textContent = `${speed}x`;
  toast.style.opacity = "1";

  clearTimeout(window.speedToastTimeout);
  window.speedToastTimeout = setTimeout(() => {
    toast.style.opacity = "0";
  }, 1500);
}
