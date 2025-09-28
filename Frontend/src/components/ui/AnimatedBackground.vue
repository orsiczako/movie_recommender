```vue
<template>
  <div class="animated-background">
    <!-- Floating shapes -->
    <div class="floating-shapes">
      <div
        v-for="i in shapeCount"
        :key="`shape-${i}`"
        :class="`shape shape-${i}`"
      ></div>
    </div>

    <!-- Holographic lights -->
    <div v-if="showLights" class="holographic-lights">
      <div
        v-for="i in lightCount"
        :key="`light-${i}`"
        :class="`light light-${i}`"
      ></div>
    </div>

    <!-- Gradient overlay -->
    <div class="gradient-overlay" :class="{ 'reduced-opacity': reduceOpacity }"></div>
  </div>
</template>

<script setup>
defineProps({
  shapeCount: {
    type: Number,
    default: 6
  },
  lightCount: {
    type: Number,
    default: 3
  },
  showLights: {
    type: Boolean,
    default: true
  },
  reduceOpacity: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg,
    rgba(229, 9, 20, 0.08) 0%,
    rgba(245, 197, 24, 0.12) 50%,
    rgba(70, 211, 105, 0.06) 100%);
  backdrop-filter: blur(2px);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  box-shadow: 0 4px 20px rgba(229, 9, 20, 0.1);
}

.shape-1 { width: 120px; height: 120px; top: 10%; left: 10%; animation: float1 8s infinite; }
.shape-2 { width: 80px; height: 80px; top: 20%; right: 15%; animation: float2 6s infinite; }
.shape-3 { width: 150px; height: 150px; bottom: 20%; left: 20%; animation: float3 10s infinite; }
.shape-4 { width: 60px; height: 60px; top: 60%; right: 25%; animation: float4 7s infinite; }
.shape-5 { width: 100px; height: 100px; bottom: 10%; right: 10%; animation: float5 9s infinite; }
.shape-6 { width: 40px; height: 40px; top: 40%; left: 60%; animation: float6 5s infinite; }

.holographic-lights {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.light {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.light-1 {
  width: 200px; height: 200px;
  top: 20%; left: 80%;
  background: radial-gradient(circle,
    rgba(229, 9, 20, 0.3) 0%,
    rgba(229, 9, 20, 0.1) 40%,
    transparent 70%);
  animation: hologram1 20s infinite;
}

.light-2 {
  width: 150px; height: 150px;
  bottom: 30%; left: 10%;
  background: radial-gradient(circle,
    rgba(245, 197, 24, 0.25) 0%,
    rgba(245, 197, 24, 0.08) 40%,
    transparent 70%);
  animation: hologram2 25s infinite;
}

.light-3 {
  width: 180px; height: 180px;
  top: 60%; right: 20%;
  background: radial-gradient(circle,
    rgba(70, 211, 105, 0.2) 0%,
    rgba(70, 211, 105, 0.06) 40%,
    transparent 70%);
  animation: hologram3 18s infinite;
}

.gradient-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 30% 70%, rgba(229, 9, 20, 0.04) 0%, transparent 60%),
              radial-gradient(circle at 70% 30%, rgba(245, 197, 24, 0.06) 0%, transparent 60%),
              radial-gradient(circle at 50% 50%, rgba(70, 211, 105, 0.03) 0%, transparent 70%);
  animation: pulse 15s ease-in-out infinite;
}
.gradient-overlay.reduced-opacity { opacity: 0.5; }

@keyframes float1 { 0%{transform:translate(0,0) rotate(0);}50%{transform:translate(30px,-20px) rotate(180deg);}100%{transform:translate(0,0) rotate(360deg);} }
@keyframes float2 { 0%{transform:translate(0,0) rotate(0);}33%{transform:translate(-25px,15px) rotate(120deg);}66%{transform:translate(20px,-10px) rotate(240deg);}100%{transform:translate(0,0) rotate(360deg);} }
@keyframes float3 { 0%{transform:translate(0,0) scale(1);}50%{transform:translate(-15px,-25px) scale(1.1);}100%{transform:translate(0,0) scale(1);} }
@keyframes float4 { 0%{transform:translate(0,0) rotate(0);}25%{transform:translate(15px,-15px) rotate(90deg);}50%{transform:translate(-10px,-20px) rotate(180deg);}75%{transform:translate(-20px,10px) rotate(270deg);}100%{transform:translate(0,0) rotate(360deg);} }
@keyframes float5 { 0%{transform:translate(0,0);}20%{transform:translate(10px,-15px);}40%{transform:translate(-15px,-10px);}60%{transform:translate(20px,5px);}80%{transform:translate(-5px,15px);}100%{transform:translate(0,0);} }
@keyframes float6 { 0%{transform:translate(0,0) rotate(0) scale(1);}50%{transform:translate(-20px,20px) rotate(180deg) scale(1.2);}100%{transform:translate(0,0) rotate(360deg) scale(1);} }

@keyframes hologram1 { 0%,100%{transform:translate(0,0) scale(1);opacity:.3;}33%{transform:translate(-30px,-50px) scale(1.1);opacity:.6;}66%{transform:translate(20px,30px) scale(.9);opacity:.4;} }
@keyframes hologram2 { 0%,100%{transform:translate(0,0) scale(1);opacity:.25;}25%{transform:translate(40px,-20px) scale(1.2);opacity:.5;}50%{transform:translate(-20px,-40px) scale(.8);opacity:.7;}75%{transform:translate(30px,20px) scale(1.1);opacity:.3;} }
@keyframes hologram3 { 0%,100%{transform:translate(0,0) scale(1);opacity:.2;}40%{transform:translate(-25px,35px) scale(1.3);opacity:.6;}80%{transform:translate(15px,-25px) scale(.7);opacity:.4;} }

@keyframes pulse { 0%,100%{opacity:.4;}50%{opacity:.7;} }
</style>
```

