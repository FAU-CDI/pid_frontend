import {
  MOCK_MOUNT_BASE_URI,
  MOCK_MOUNT_PATH,
  MOCK_NAMESPACE_ID,
  MOCK_PID_MISSING,
  MOCK_PID_WITH_URL,
} from "@/lib/backend/mock-data";
import { hrefForResolved } from "./resolve-href";

const publicBase = "https://resolver.test";

describe("hrefForResolved", () => {
  it("links namespace results to the namespace page", () => {
    expect(
      hrefForResolved(
        {
          kind: "namespace",
          namespace: MOCK_NAMESPACE_ID,
          exists: true,
        },
        publicBase
      )
    ).toBe(`/resolve/${MOCK_NAMESPACE_ID}`);
  });

  it("links missing namespaces to the namespace page", () => {
    expect(
      hrefForResolved(
        {
          kind: "namespace",
          namespace: "111",
          exists: false,
        },
        publicBase
      )
    ).toBe("/resolve/111");
  });

  it("links mount namespace results to the mount path", () => {
    expect(
      hrefForResolved(
        {
          kind: "namespace",
          mount: MOCK_MOUNT_BASE_URI,
          namespace: MOCK_NAMESPACE_ID,
          exists: true,
        },
        publicBase
      )
    ).toBe(`/${MOCK_MOUNT_PATH}`);
  });

  it("links existing resources to the details page", () => {
    expect(
      hrefForResolved(
        {
          kind: "resource",
          namespace: MOCK_NAMESPACE_ID,
          pid: MOCK_PID_WITH_URL,
          go: false,
          exists: true,
        },
        publicBase
      )
    ).toBe(`/resolve/${MOCK_NAMESPACE_ID}/${MOCK_PID_WITH_URL}`);
  });

  it("links existing resources with go to the Open URL route", () => {
    expect(
      hrefForResolved(
        {
          kind: "resource",
          mount: MOCK_MOUNT_BASE_URI,
          namespace: MOCK_NAMESPACE_ID,
          pid: MOCK_PID_WITH_URL,
          go: true,
          exists: true,
        },
        publicBase
      )
    ).toBe(`/${MOCK_MOUNT_PATH}/${MOCK_PID_WITH_URL}/go`);
  });

  it("links missing PIDs to the details page, never /go", () => {
    expect(
      hrefForResolved(
        {
          kind: "resource",
          namespace: MOCK_NAMESPACE_ID,
          pid: MOCK_PID_MISSING,
          go: true,
          exists: false,
        },
        publicBase
      )
    ).toBe(`/resolve/${MOCK_NAMESPACE_ID}/${MOCK_PID_MISSING}`);

    expect(
      hrefForResolved(
        {
          kind: "resource",
          mount: MOCK_MOUNT_BASE_URI,
          pid: MOCK_PID_MISSING,
          go: true,
          exists: false,
        },
        publicBase
      )
    ).toBe(`/${MOCK_MOUNT_PATH}/${MOCK_PID_MISSING}`);
  });
});
