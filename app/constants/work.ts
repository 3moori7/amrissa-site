import * as THREE from "three";
import { WorkTimelinePoint } from "../types";

export const WORK_TIMELINE: WorkTimelinePoint[] = [
  {
    point: new THREE.Vector3(0, 0, 0),
    year: 'Feb 2024',
    title: 'Library Assistant',
    subtitle: 'Alfaisal University',
    position: 'right',
  },
  {
    point: new THREE.Vector3(-4, -4, -3),
    year: 'Jul 2025',
    title: 'Software Solutions Specialist',
    subtitle: '2P Perfect Presentation',
    position: 'left',
  },
  {
    point: new THREE.Vector3(-3, -1, -6),
    year: 'Aug 2025',
    title: 'Treasurer',
    subtitle: 'ACM',
    position: 'left',
  },
  {
    point: new THREE.Vector3(0, -1, -10),
    year: 'Aug 2025',
    title: 'Teacher Assistant',
    subtitle: 'Alfaisal University',
    position: 'left',
  },
  {
    point: new THREE.Vector3(1, 1, -12),
    year: 'Current',
    title: 'Research Lead',
    subtitle: 'Alfaisal University GIC',
    position: 'right',
  }
]