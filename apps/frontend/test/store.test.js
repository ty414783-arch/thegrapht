import test from "node:test";
import assert from "node:assert/strict";

import { createStore } from "../src/client/store/create-store.ts";
import { initialAppState } from "../src/client/store/types.ts";
import { messageActions, dialogActions } from "../src/client/store/index.ts";
import { appStore } from "../src/client/store/index.ts";

test("store replaces optimistic message on confirm", () => {
  appStore.setState(initialAppState());
  messageActions.append({
    id: "local_1",
    body: "hello",
    localStatus: "pending",
    createdAt: new Date().toISOString()
  });
  messageActions.replaceLocal("local_1", {
    id: "msg_1",
    body: "hello",
    createdAt: new Date().toISOString()
  });

  const state = appStore.getState();
  assert.equal(state.messages.current.length, 1);
  assert.equal(state.messages.current[0].id, "msg_1");
  assert.equal(state.messages.localOutgoing.length, 0);
});

test("dialogActions.clearUnread zeroes badge", () => {
  appStore.setState(initialAppState());
  dialogActions.setAll([
    { id: "dlg_1", publicId: "-1001", unreadCount: 3, type: "direct" }
  ]);
  dialogActions.clearUnread("-1001");
  assert.equal(appStore.getState().dialogs.all[0].unreadCount, 0);
});

test("createStore notifies subscribers", () => {
  const store = createStore({ count: 0 });
  let seen = 0;
  const unsubscribe = store.subscribe((state) => {
    seen = state.count;
  });
  store.setState({ count: 2 });
  unsubscribe();
  assert.equal(seen, 2);
});
