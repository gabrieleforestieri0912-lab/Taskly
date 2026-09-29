import 'package:socket_io_client/socket_io_client.dart' as io;

import '../config.dart';

/// Connessione Socket.IO (porting di `src/utils/socket.js`).
class SocketService {
  SocketService._();

  static io.Socket? _socket;

  static io.Socket getSocket() {
    _socket ??= io.io(
      Config.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .build(),
    );
    return _socket!;
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
