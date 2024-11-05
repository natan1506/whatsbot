import { createBrowserRouter } from "react-router-dom";
import { QrCode } from "./pages/Qrcode";
import { Chats } from "./pages/Chats";
import { ForceLogout } from "./pages/ForceLogout";
import { Messages } from "./pages/Messages";

// const PrivateRoute = ({ children }) => {
//   const verifyLocalStorage = JSON.parse(localStorage.getItem('watchAllCredentions'))

//   return isAuthenticated ? children : <Navigate to="/login" />;
// };

export const router = createBrowserRouter([
  {
    path: "/",
    element: <QrCode/>
  },
  {
    path: "/chats",
    element: <Chats/>
  },
  {
    path: "/force-logout",
    element: <ForceLogout/>
  },
  {
    path: "/messages",
    element: <Messages/>
  }
]);
