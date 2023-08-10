import { useThree, useFrame } from '@react-three/fiber'
import { EffectComposer, RenderPass, EffectPass, SMAAEffect, FXAAEffect, EdgeDetectionMode } from 'postprocessing'
import { useEffect, useState } from 'react'
import { SSGIEffect, TRAAEffect, MotionBlurEffect, VelocityDepthNormalPass } from './realism-effects/index'

export function Effects({ importanceSampling }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const [composer] = useState(() => new EffectComposer(gl, { multisampling: 0 }))
  useEffect(() => composer.setSize(size.width, size.height), [composer, size])
  useEffect(() => {
    const config = {
      distance: 3,
      thickness: 1.999999999999997,
      maxRoughness: 1,
      blend: 0.9749999999999999,
      denoiseIterations: 1,
      denoiseKernel: 3,
      denoiseDiffuse: 25,
      denoiseSpecular: 25.54,
      rings: 5,
      samples: 4,
      radius: 100,
      phi: 0.5870000000000001,
      lumaPhi: 5.978000000000001,
      depthPhi: 11.956999999999997,
      normalPhi: 21.739,
      roughnessPhi: 9.782999999999998,
      diffusePhi: 6.028164079019405e-15,
      envBlur: 0,
      importanceSampling,
      steps: 20,
      refineSteps: 4,
      spp: 1,
      resolutionScale: 1,
      missedRays: false
    }

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
    composer.addPass(velocityDepthNormalPass)

    const ssgiEffect = new SSGIEffect(composer, scene, camera, velocityDepthNormalPass, config)

    const motionBlur = new MotionBlurEffect(velocityDepthNormalPass)
    const traa = new TRAAEffect(scene, camera, velocityDepthNormalPass)
    const smaa = new SMAAEffect()
    const fxaa = new FXAAEffect()

    const effectPass1 = new EffectPass(camera, ssgiEffect)
    const effectPass2 = new EffectPass(camera, motionBlur)
    const effectPass3 = new EffectPass(camera, traa)

    composer.addPass(effectPass1)
    //composer.addPass(effectPass2)
    composer.addPass(effectPass3)
    return () => {
      composer.removeAllPasses()
    }
  }, [composer, camera, scene, importanceSampling])
  useFrame((state, delta) => {
    gl.autoClear = true // ?
    composer.render(delta)
  }, 1)
}
