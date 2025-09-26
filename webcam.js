let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let output = document.getElementById("output");

let detector;
let baseY = null;
let maxJump = 0;

// Camera start
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

// Pose detector setup
async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
  await setupCamera();
  video.play();
  requestAnimationFrame(detectPose);
}

// Detect pose
async function detectPose() {
  const poses = await detector.estimatePoses(video);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (poses.length > 0) {
    let keypoints = poses[0].keypoints;

    // Nose ka Y coordinate lete hain
    let nose = keypoints.find((k) => k.name === "nose");

    if (nose && nose.score > 0.5) {
      ctx.beginPath();
      ctx.arc(nose.x, nose.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();

      if (baseY === null) {
        baseY = nose.y; // Starting baseline
      } else {
        let jumpHeight = baseY - nose.y;
        if (jumpHeight > maxJump) {
          maxJump = jumpHeight;
        }

        // Convert pixels → cm (approx)
        let heightCm = (maxJump / canvas.height) * 170; // मान लो average height 170cm
        output.innerText = `Jump Height: ${heightCm.toFixed(2)} cm`;
      }
    }
  }

  requestAnimationFrame(detectPose);
}

init();
