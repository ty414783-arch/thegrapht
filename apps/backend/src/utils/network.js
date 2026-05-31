import net from "node:net";

export const checkTcp = (targetHost, targetPort) =>
  new Promise((resolve) => {
    const socket = net.connect(targetPort, targetHost);

    const finish = (result) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(1500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
