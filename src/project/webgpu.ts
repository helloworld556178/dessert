/// <reference types="@webgpu/types" />

// webgpu的基本操作

async function init() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    device.createShaderModule
    device.createBindGroupLayout
    
    // layout, module
    device.createComputePipeline
    // 接收并映射
    device.createBuffer
    // layout, buffer
    device.createBindGroup

    // pipeline, bindGroup
    // buffer
    device.createCommandEncoder
    device.queue.submit
}