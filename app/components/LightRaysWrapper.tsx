"use client";

import LightRays from "./LightRays"

export default  function LightRaysWrapper() {
    return <LightRays
        raysOrigin="top-center-offset"
        raysColor="#5dfeca"
        raysSpeed={0.5}
        lightSpread={0.9}
        rayLength={1.4}
        followMouse={true}
        mouseInfluence={0.02}
        noiseAmount={0.0}
        distortion={0.01}
    />;
}