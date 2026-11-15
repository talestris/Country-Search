import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./debounce.js";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not call the function immediately", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("sp");

    expect(fn).not.toHaveBeenCalled();
  });

  it("calls the function after the specified delay with latest arguments", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("spain");
    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("spain");
  });

  it("resets the timer if called again before delay expires", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("s");
    vi.advanceTimersByTime(200);

    debounced("sp");
    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("sp");
  });
});
