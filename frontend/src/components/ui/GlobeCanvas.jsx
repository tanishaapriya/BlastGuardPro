import { useEffect, useRef } from 'react';

/**
 * Interactive 3D Wireframe Globe
 * - Auto-rotates
 * - Mouse drag to spin
 * - Hover parallax tilt
 * - Pure canvas — zero extra deps
 */
export default function GlobeCanvas({ width = 600, height = 600 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ── State ──────────────────────────────────────────────
    let rotY = 0;          // auto-spin angle
    let rotX = 0.3;        // tilt
    let dragStartX = null;
    let dragStartY = null;
    let dragRotY = 0;
    let dragRotX = 0;
    let isDragging = false;
    let targetRotY = 0;
    let targetRotX = 0.3;
    let mouseX = 0;
    let mouseY = 0;
    let animId;

    const R = Math.min(width, height) * 0.36;
    const cx = width / 2;
    const cy = height / 2;

    // ── Dot seeds (surface points for "cities") ───────────
    const DOTS = Array.from({ length: 80 }, () => ({
      lat: (Math.random() - 0.5) * Math.PI,
      lng: Math.random() * Math.PI * 2,
      r: Math.random() * 1.8 + 0.8,
    }));

    // ── Maths helpers ──────────────────────────────────────
    function project(x3, y3, z3, ry, rx) {
      // rotate Y
      const x1 = x3 * Math.cos(ry) - z3 * Math.sin(ry);
      const z1 = x3 * Math.sin(ry) + z3 * Math.cos(ry);
      // rotate X
      const y2 = y3 * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y3 * Math.sin(rx) + z1 * Math.cos(rx);
      // perspective
      const fov = 2.2;
      const scale = fov / (fov + z2 / R);
      return { sx: cx + x1 * scale, sy: cy + y2 * scale, z2, visible: z2 > -R * 0.85 };
    }

    function latLngToXYZ(lat, lng) {
      return {
        x: R * Math.cos(lat) * Math.sin(lng),
        y: R * Math.sin(lat),
        z: R * Math.cos(lat) * Math.cos(lng),
      };
    }

    // ── Draw frame ─────────────────────────────────────────
    function draw() {
      ctx.clearRect(0, 0, width, height);

      const ry = rotY + dragRotY;
      const rx = rotX + dragRotX;

      // ── Glow backdrop ──
      const grd = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.4);
      grd.addColorStop(0, 'rgba(59,130,246,0.08)');
      grd.addColorStop(0.5, 'rgba(59,130,246,0.04)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      // ── Latitude lines ──
      const LAT_LINES = 10;
      for (let i = 0; i <= LAT_LINES; i++) {
        const lat = (i / LAT_LINES) * Math.PI - Math.PI / 2;
        const pts = [];
        const SEG = 80;
        for (let j = 0; j <= SEG; j++) {
          const lng = (j / SEG) * Math.PI * 2;
          const { x, y, z } = latLngToXYZ(lat, lng);
          const p = project(x, y, z, ry, rx);
          pts.push(p);
        }
        // Draw visible segments
        ctx.beginPath();
        let drawing = false;
        for (let k = 0; k < pts.length; k++) {
          const p = pts[k];
          if (p.visible) {
            if (!drawing) { ctx.moveTo(p.sx, p.sy); drawing = true; }
            else ctx.lineTo(p.sx, p.sy);
          } else {
            drawing = false;
          }
        }
        const alpha = 0.12 + 0.04 * Math.abs(Math.sin(lat));
        ctx.strokeStyle = `rgba(99,179,237,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // ── Longitude lines ──
      const LNG_LINES = 16;
      for (let i = 0; i < LNG_LINES; i++) {
        const lng = (i / LNG_LINES) * Math.PI * 2;
        const pts = [];
        const SEG = 80;
        for (let j = 0; j <= SEG; j++) {
          const lat = (j / SEG) * Math.PI - Math.PI / 2;
          const { x, y, z } = latLngToXYZ(lat, lng);
          const p = project(x, y, z, ry, rx);
          pts.push(p);
        }
        ctx.beginPath();
        let drawing = false;
        for (let k = 0; k < pts.length; k++) {
          const p = pts[k];
          if (p.visible) {
            if (!drawing) { ctx.moveTo(p.sx, p.sy); drawing = true; }
            else ctx.lineTo(p.sx, p.sy);
          } else {
            drawing = false;
          }
        }
        ctx.strokeStyle = 'rgba(99,179,237,0.10)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // ── Equator highlight ──
      {
        const pts = [];
        for (let j = 0; j <= 120; j++) {
          const lng = (j / 120) * Math.PI * 2;
          const { x, y, z } = latLngToXYZ(0, lng);
          pts.push(project(x, y, z, ry, rx));
        }
        ctx.beginPath();
        let drawing = false;
        for (const p of pts) {
          if (p.visible) {
            if (!drawing) { ctx.moveTo(p.sx, p.sy); drawing = true; }
            else ctx.lineTo(p.sx, p.sy);
          } else drawing = false;
        }
        ctx.strokeStyle = 'rgba(59,130,246,0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // ── Outer glow ring ──
      const ringGrd = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.08);
      ringGrd.addColorStop(0, 'rgba(59,130,246,0.18)');
      ringGrd.addColorStop(1, 'rgba(59,130,246,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = ringGrd;
      ctx.lineWidth = R * 0.08;
      ctx.stroke();

      // ── Surface dots ──
      for (const dot of DOTS) {
        const { x, y, z } = latLngToXYZ(dot.lat, dot.lng);
        const p = project(x, y, z, ry, rx);
        if (!p.visible) continue;
        const depth = (p.z2 + R) / (2 * R);   // 0..1
        const alpha = 0.3 + depth * 0.7;
        const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, dot.r * 3);
        glow.addColorStop(0, `rgba(147,197,253,${alpha})`);
        glow.addColorStop(1, 'rgba(147,197,253,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, dot.r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(220,240,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Pole markers ──
      {
        const poles = [{ lat: Math.PI / 2, lng: 0 }, { lat: -Math.PI / 2, lng: 0 }];
        for (const pole of poles) {
          const { x, y, z } = latLngToXYZ(pole.lat, pole.lng);
          const p = project(x, y, z, ry, rx);
          if (!p.visible) continue;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(147,197,253,0.9)';
          ctx.fill();
        }
      }
    }

    // ── Animation loop ─────────────────────────────────────
    let lastTime = performance.now();
    function loop(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (!isDragging) {
        rotY += 0.18 * dt;   // auto-spin
        // parallax tilt towards mouse
        const tx = ((mouseX / width) - 0.5) * 0.35;
        const ty = ((mouseY / height) - 0.5) * -0.25;
        targetRotX = 0.3 + ty;
        rotX += (targetRotX - rotX) * 0.04;
      }
      draw();
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    // ── Drag handlers ──────────────────────────────────────
    function onMouseDown(e) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragRotY = 0;
      dragRotX = 0;
    }
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (isDragging) {
        dragRotY = (e.clientX - dragStartX) * 0.007;
        dragRotX = (e.clientY - dragStartY) * 0.005;
      }
    }
    function onMouseUp() {
      if (isDragging) {
        rotY += dragRotY;
        rotX += dragRotX;
        dragRotY = 0;
        dragRotX = 0;
        isDragging = false;
      }
    }

    // Touch support
    function onTouchStart(e) {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
      }
    }
    function onTouchMove(e) {
      if (isDragging && e.touches.length === 1) {
        dragRotY = (e.touches[0].clientX - dragStartX) * 0.007;
        dragRotX = (e.touches[0].clientY - dragStartY) * 0.005;
      }
    }
    function onTouchEnd() {
      if (isDragging) {
        rotY += dragRotY;
        rotX += dragRotX;
        dragRotY = 0;
        dragRotX = 0;
        isDragging = false;
      }
    }

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ cursor: 'grab', display: 'block', userSelect: 'none' }}
    />
  );
}
