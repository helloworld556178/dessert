/**
 * 提供一种方法，可以屏蔽或取消屏蔽其创建的事件处理函数
 */
interface EventBatch {
    /**
     * 是否静默本实例创建的所有事件回调
     */
    mute(flag: boolean): void;
    /**
     * 创建一个可以被本实例静默的事件回调
     * @param callback 待创建的时间回调
     */
    createEvent(callback: Function): void;
}