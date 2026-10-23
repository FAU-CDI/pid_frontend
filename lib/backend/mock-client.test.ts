import { isBackendError } from "./base";
import { MockClient } from "./mock-client";
import { MOCK_RESOURCES } from "./mock-data";

describe("MockClient getResourceCount", () => {
  it("returns the number of mock resources including deleted", async () => {
    const result = await new MockClient().getResourceCount();
    expect(isBackendError(result)).toBe(false);
    if (isBackendError(result)) {
      return;
    }
    expect(result.total).toBe(Object.keys(MOCK_RESOURCES).length);
    expect(result.total).toBe(4);
  });
});
