<template>
  <div class="storm-bg" aria-hidden="true">
    <div class="storm-bg__layer storm-bg__layer--far" />
    <div class="storm-bg__layer storm-bg__layer--near" />
    <div class="storm-bg__noise" />
  </div>
</template>

<style scoped>
.storm-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.storm-bg__layer {
  position: absolute;
  inset: -10% -20%;
  background-image:
    radial-gradient(ellipse 60% 40% at 30% 30%, rgba(40, 40, 60, 0.6), transparent 70%),
    radial-gradient(ellipse 70% 50% at 70% 50%, rgba(20, 20, 35, 0.7), transparent 70%),
    radial-gradient(ellipse 50% 30% at 50% 80%, rgba(50, 50, 75, 0.45), transparent 70%);
  filter: blur(20px);
}

.storm-bg__layer--far {
  opacity: 0.55;
  animation: storm-drift-far 70s linear infinite;
}

.storm-bg__layer--near {
  opacity: 0.85;
  background-image:
    radial-gradient(ellipse 50% 40% at 20% 60%, rgba(30, 30, 45, 0.7), transparent 70%),
    radial-gradient(ellipse 60% 30% at 80% 20%, rgba(15, 15, 25, 0.85), transparent 70%);
  animation: storm-drift-near 45s linear infinite;
}

.storm-bg__noise {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
}

@keyframes storm-drift-far {
  0%   { transform: translate3d(0, 0, 0)      scale(1.05); }
  50%  { transform: translate3d(-3%, 1%, 0)   scale(1.08); }
  100% { transform: translate3d(0, 0, 0)      scale(1.05); }
}

@keyframes storm-drift-near {
  0%   { transform: translate3d(0, 0, 0)      scale(1.1); }
  50%  { transform: translate3d(2%, -1.5%, 0) scale(1.13); }
  100% { transform: translate3d(0, 0, 0)      scale(1.1); }
}

@media (prefers-reduced-motion: reduce) {
  .storm-bg__layer--far,
  .storm-bg__layer--near {
    animation: none;
  }
}
</style>
