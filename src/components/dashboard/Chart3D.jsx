import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Chart3D({ data, type = 'bar' }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    // Clear previous scene
    if (sceneRef.current && rendererRef.current && rendererRef.current.domElement) {
      sceneRef.current.clear();
      if (rendererRef.current.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(6, 6, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Create chart based on type
    if (type === 'bar') {
      createBarChart(scene, data);
    } else if (type === 'pie') {
      createPieChart(scene, data);
    }

    // Animation
    let rotation = 0;
    const animate = () => {
      rotation += 0.005;
      scene.rotation.y = rotation;
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current?.domElement) {
        const domElement = rendererRef.current.domElement;
        if (domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(domElement);
        }
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [data, type]);

  const createBarChart = (scene, chartData) => {
    const maxValue = Math.max(...chartData.map(d => d.value));
    const barWidth = 0.8;
    const spacing = 2;

    chartData.forEach((item, index) => {
      const height = (item.value / maxValue) * 5;
      const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
      const material = new THREE.MeshPhongMaterial({
        color: item.color || 0x3b82f6,
        shininess: 100
      });
      const bar = new THREE.Mesh(geometry, material);
      
      const x = (index - chartData.length / 2) * spacing;
      bar.position.set(x, height / 2, 0);
      scene.add(bar);

      // Add edge lines
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      wireframe.position.copy(bar.position);
      scene.add(wireframe);
    });
  };

  const createPieChart = (scene, chartData) => {
    const total = chartData.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = 0;
    const radius = 3;
    const thickness = 1;

    chartData.forEach((item) => {
      const angle = (item.value / total) * Math.PI * 2;
      const geometry = new THREE.CylinderGeometry(
        radius,
        radius,
        thickness,
        32,
        1,
        false,
        currentAngle,
        angle
      );
      const material = new THREE.MeshPhongMaterial({
        color: item.color || 0x3b82f6,
        shininess: 100
      });
      const slice = new THREE.Mesh(geometry, material);
      slice.rotation.x = Math.PI / 2;
      scene.add(slice);

      currentAngle += angle;
    });
  };

  return <div ref={containerRef} className="w-full h-full" />;
}