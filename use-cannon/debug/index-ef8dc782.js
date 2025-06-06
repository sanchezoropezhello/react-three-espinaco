import React, { useContext, useState, useRef, useEffect, useLayoutEffect, useMemo, createContext, Suspense, lazy } from 'react';
import { Object3D, MathUtils, InstancedMesh, DynamicDrawUsage, Geometry, Vector3, Face3 } from 'three';
import { useFrame } from 'react-three-fiber';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const temp = new Object3D();

function prepare(object, props, argFn) {
  props.args = argFn(props.args);
  object.position.set(...(props.position || [0, 0, 0]));
  object.rotation.set(...(props.rotation || [0, 0, 0]));
  return props;
}

function apply(object, index, buffers) {
  if (index !== undefined) {
    object.position.fromArray(buffers.positions, index * 3);
    object.quaternion.fromArray(buffers.quaternions, index * 4);
  }
}

let subscriptionGuid = 0;

function useBody(type, fn, argFn, fwdRef) {
  const localRef = useRef(null);
  const ref = fwdRef ? fwdRef : localRef;
  const {
    worker,
    bodies,
    buffers,
    refs,
    events,
    subscriptions
  } = useContext(context);
  useLayoutEffect(() => {
    if (!ref.current) {
      // When the reference isn't used we create a stub
      // The body doesn't have a visual representation but can still be constrained
      ref.current = new Object3D();
    }

    const object = ref.current;
    const currentWorker = worker;
    let uuid = [object.uuid],
        props;

    if (object instanceof InstancedMesh) {
      // Why? Because @mrdoob did it in his example ...
      object.instanceMatrix.setUsage(DynamicDrawUsage);
      uuid = new Array(object.count).fill(0).map((_, i) => object.uuid + "/" + i);
      props = uuid.map((id, i) => {
        const props = prepare(temp, fn(i), argFn);
        temp.updateMatrix();
        object.setMatrixAt(i, temp.matrix);
        object.instanceMatrix.needsUpdate = true;
        return props;
      });
    } else props = [prepare(object, fn(0), argFn)];

    props.forEach((props, index) => {
      refs[uuid[index]] = object;

      if (props.onCollide) {
        events[uuid[index]] = props.onCollide;
        props.onCollide = true;
      }
    }); // Register on mount, unregister on unmount

    currentWorker.postMessage({
      op: 'addBodies',
      type,
      uuid,
      props
    });
    return () => {
      props.forEach((props, index) => {
        delete refs[uuid[index]];
        if (props.onCollide) delete events[uuid[index]];
      });
      currentWorker.postMessage({
        op: 'removeBodies',
        uuid
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    if (ref.current && buffers.positions.length && buffers.quaternions.length) {
      if (ref.current instanceof InstancedMesh) {
        for (let i = 0; i < ref.current.count; i++) {
          const index = bodies.current[ref.current.uuid + "/" + i];

          if (index !== undefined) {
            apply(temp, index, buffers);
            temp.updateMatrix();
            ref.current.setMatrixAt(i, temp.matrix);
          }

          ref.current.instanceMatrix.needsUpdate = true;
        }
      } else apply(ref.current, bodies.current[ref.current.uuid], buffers);
    }
  });
  const api = useMemo(() => {
    const getUUID = index => index !== undefined ? ref.current.uuid + "/" + index : ref.current.uuid;

    const post = (op, index, props) => ref.current && worker.postMessage({
      op,
      uuid: getUUID(index),
      props
    });

    const subscribe = (type, index) => {
      return callback => {
        const id = subscriptionGuid++;
        subscriptions[id] = callback;
        post('subscribe', index, {
          id,
          type
        });
        return () => {
          delete subscriptions[id];
          post('unsubscribe', index, id);
        };
      };
    };

    const opString = (action, type) => action + type.charAt(0).toUpperCase() + type.slice(1);

    const makeVec = (type, index) => ({
      set: (x, y, z) => post(opString('set', type), index, [x, y, z]),
      copy: ({
        x,
        y,
        z
      }) => post(opString('set', type), index, [x, y, z]),
      subscribe: subscribe(type, index)
    });

    const makeAtomic = (type, index) => ({
      set: value => post(opString('set', type), index, value),
      subscribe: subscribe(type, index)
    });

    function makeApi(index) {
      return {
        // Vectors
        position: makeVec('position', index),
        rotation: makeVec('quaternion', index),
        velocity: makeVec('velocity', index),
        angularVelocity: makeVec('angularVelocity', index),
        linearFactor: makeVec('linearFactor', index),
        angularFactor: makeVec('angularFactor', index),
        // Atomic props
        mass: makeAtomic('mass', index),
        linearDamping: makeAtomic('linearDamping', index),
        angularDamping: makeAtomic('angularDamping', index),
        allowSleep: makeAtomic('allowSleep', index),
        sleepSpeedLimit: makeAtomic('sleepSpeedLimit', index),
        sleepTimeLimit: makeAtomic('sleepTimeLimit', index),
        collisionFilterGroup: makeAtomic('collisionFilterGroup', index),
        collisionFilterMask: makeAtomic('collisionFilterMask', index),
        fixedRotation: makeAtomic('fixedRotation', index),

        // Apply functions
        applyForce(force, worldPoint) {
          post('applyForce', index, [force, worldPoint]);
        },

        applyImpulse(impulse, worldPoint) {
          post('applyImpulse', index, [impulse, worldPoint]);
        },

        applyLocalForce(force, localPoint) {
          post('applyLocalForce', index, [force, localPoint]);
        },

        applyLocalImpulse(impulse, localPoint) {
          post('applyLocalImpulse', index, [impulse, localPoint]);
        }

      };
    }

    const cache = {};
    return _extends({}, makeApi(undefined), {
      at: index => cache[index] || (cache[index] = makeApi(index))
    });
  }, []);
  return [ref, api];
}

function usePlane(fn, fwdRef) {
  return useBody('Plane', fn, () => [], fwdRef);
}
function useBox(fn, fwdRef) {
  return useBody('Box', fn, args => args || [1, 1, 1], fwdRef);
}
function useCylinder(fn, fwdRef) {
  return useBody('Cylinder', fn, args => args, fwdRef);
}
function useHeightfield(fn, fwdRef) {
  return useBody('Heightfield', fn, args => args, fwdRef);
}
function useParticle(fn, fwdRef) {
  return useBody('Particle', fn, () => [], fwdRef);
}
function useSphere(fn, fwdRef) {
  return useBody('Sphere', fn, radius => [radius != null ? radius : 1], fwdRef);
}
function useTrimesh(fn, fwdRef) {
  return useBody('Trimesh', fn, args => {
    const vertices = args instanceof Geometry ? args.vertices : args[0];
    const indices = args instanceof Geometry ? args.faces : args[1];
    return [vertices.map(v => v instanceof Vector3 ? [v.x, v.y, v.z] : v), indices.map(i => i instanceof Face3 ? [i.a, i.b, i.c] : i)];
  }, fwdRef);
}
function useConvexPolyhedron(fn, fwdRef) {
  return useBody('ConvexPolyhedron', fn, args => {
    const vertices = args instanceof Geometry ? args.vertices : args[0];
    const faces = args instanceof Geometry ? args.faces : args[1];
    const normals = args instanceof Geometry ? args.faces.map(f => f.normal) : args[2];
    return [vertices.map(v => v instanceof Vector3 ? [v.x, v.y, v.z] : v), faces.map(f => f instanceof Face3 ? [f.a, f.b, f.c] : f), normals && normals.map(n => n instanceof Vector3 ? [n.x, n.y, n.z] : n)];
  }, fwdRef);
}
function useCompoundBody(fn, fwdRef) {
  return useBody('Compound', fn, args => args || [], fwdRef);
}

function useConstraint(type, bodyA, bodyB, optns = {}, deps = []) {
  const {
    worker
  } = useContext(context);
  const uuid = MathUtils.generateUUID();
  const nullRef1 = useRef(null);
  const nullRef2 = useRef(null);
  bodyA = bodyA === undefined || bodyA === null ? nullRef1 : bodyA;
  bodyB = bodyB === undefined || bodyB === null ? nullRef2 : bodyB;
  useEffect(() => {
    if (bodyA.current && bodyB.current) {
      worker.postMessage({
        op: 'addConstraint',
        uuid,
        type,
        props: [bodyA.current.uuid, bodyB.current.uuid, optns]
      });
      return () => worker.postMessage({
        op: 'removeConstraint',
        uuid
      });
    }
  }, deps);
  const api = useMemo(() => ({
    enable: () => worker.postMessage({
      op: 'enableConstraint',
      uuid
    }),
    disable: () => worker.postMessage({
      op: 'disableConstraint',
      uuid
    })
  }), deps);
  return [bodyA, bodyB, api];
}

function usePointToPointConstraint(bodyA, bodyB, optns, deps = []) {
  return useConstraint('PointToPoint', bodyA, bodyB, optns, deps);
}
function useConeTwistConstraint(bodyA, bodyB, optns, deps = []) {
  return useConstraint('ConeTwist', bodyA, bodyB, optns, deps);
}
function useDistanceConstraint(bodyA, bodyB, optns, deps = []) {
  return useConstraint('Distance', bodyA, bodyB, optns, deps);
}
function useHingeConstraint(bodyA, bodyB, optns, deps = []) {
  return useConstraint('Hinge', bodyA, bodyB, optns, deps);
}
function useLockConstraint(bodyA, bodyB, optns, deps = []) {
  return useConstraint('Lock', bodyA, bodyB, optns, deps);
}
function useSpring(bodyA, bodyB, optns, deps = []) {
  const {
    worker,
    events
  } = useContext(context);
  const [uuid] = useState(() => MathUtils.generateUUID());
  const nullRef1 = useRef(null);
  const nullRef2 = useRef(null);
  bodyA = bodyA === undefined || bodyA === null ? nullRef1 : bodyA;
  bodyB = bodyB === undefined || bodyB === null ? nullRef2 : bodyB;
  useEffect(() => {
    if (bodyA.current && bodyB.current) {
      worker.postMessage({
        op: 'addSpring',
        uuid,
        props: [bodyA.current.uuid, bodyB.current.uuid, optns]
      });

      events[uuid] = () => {};

      return () => {
        worker.postMessage({
          op: 'removeSpring',
          uuid
        });
        delete events[uuid];
      };
    }
  }, deps);
  return [bodyA, bodyB];
}

function useRay(mode, options, callback, deps = []) {
  const {
    worker,
    events
  } = useContext(context);
  const [uuid] = useState(() => MathUtils.generateUUID());
  useEffect(() => {
    events[uuid] = callback;
    worker.postMessage({
      op: 'addRay',
      uuid,
      props: _extends({
        mode
      }, options)
    });
    return () => {
      worker.postMessage({
        op: 'removeRay',
        uuid
      });
      delete events[uuid];
    };
  }, deps);
}

function useRaycastClosest(options, callback, deps = []) {
  useRay('Closest', options, callback, deps);
}
function useRaycastAny(options, callback, deps = []) {
  useRay('Any', options, callback, deps);
}
function useRaycastAll(options, callback, deps = []) {
  useRay('All', options, callback, deps);
}
function useRaycastVehicle(fn, fwdRef) {
  // const localRef = useRef<THREE.Object3D>((null as unknown) as THREE.Object3D)
  const ref = fwdRef ? fwdRef : useRef(null);
  const {
    worker,
    events
  } = useContext(context);
  useLayoutEffect(() => {
    if (!ref.current) {
      // When the reference isn't used we create a stub
      // The body doesn't have a visual representation but can still be constrained
      ref.current = new Object3D();
    }

    const object = ref.current;
    const currentWorker = worker;
    let uuid = [object.uuid];
    const raycastVehicleProps = fn(); // console.log(raycastVehicleProps.wheels.map(wheel => wheel.current !== undefined && wheel.current !== null).length)
    // console.log('uuid', uuid)
    // console.log('raycastVehicleProps', raycastVehicleProps)
    // console.log('chassisBody', raycastVehicleProps.chassisBody)
    // console.log('wheelInfos', raycastVehicleProps.wheelInfos)
    // console.log('wheels', raycastVehicleProps.wheels)
    // console.log('send to worker')

    currentWorker.postMessage({
      op: 'addRaycastVehicle',
      uuid,
      // type,
      props: [raycastVehicleProps.chassisBody.current === undefined || raycastVehicleProps.chassisBody.current == null ? null : raycastVehicleProps.chassisBody.current.uuid, raycastVehicleProps.wheels.map(wheel => wheel.current === undefined || wheel.current === null ? null : wheel.current.uuid), raycastVehicleProps.wheelInfos, raycastVehicleProps.indexForwardAxis, raycastVehicleProps.indexRightAxis, raycastVehicleProps.indexUpAxis]
    });
    return () => {
      currentWorker.postMessage({
        op: 'removeRaycastVehicle',
        uuid
      });
    };
  }, []);
  const api = useMemo(() => {
    const getUUID = index => index !== undefined ? ref.current.uuid + "/" + index : ref.current.uuid;

    const post = (op, index, props) => ref.current && worker.postMessage({
      op,
      uuid: getUUID(index),
      props
    });

    function makeApi(index) {
      return {
        setSteeringValue(value, wheelIndex) {
          post('setRaycastVehicleSteeringValue', index, [value, wheelIndex]);
        },

        applyEngineForce(value, wheelIndex) {
          post('applyRaycastVehicleEngineForce', index, [value, wheelIndex]);
        },

        setBrake(brake, wheelIndex) {
          post('setRaycastVehicleBrake', index, [brake, wheelIndex]);
        }

      };
    }

    return _extends({}, makeApi(undefined));
  }, []);
  return [ref, api];
}

const context = /*#__PURE__*/createContext({});
const Provider = typeof window === 'undefined' ? () => null : /*#__PURE__*/lazy(() => import('./Provider-09c1fb67.js'));

function Physics(props) {
  return /*#__PURE__*/React.createElement(Suspense, {
    fallback: null
  }, /*#__PURE__*/React.createElement(Provider, props));
}

export { Physics as P, _extends as _, useBox as a, useCylinder as b, context as c, useHeightfield as d, useParticle as e, useSphere as f, useTrimesh as g, useConvexPolyhedron as h, useCompoundBody as i, usePointToPointConstraint as j, useConeTwistConstraint as k, useDistanceConstraint as l, useHingeConstraint as m, useLockConstraint as n, useSpring as o, useRaycastClosest as p, useRaycastAny as q, useRaycastAll as r, useRaycastVehicle as s, usePlane as u };
