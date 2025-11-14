import { Avatar } from "@mui/material";

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/*
Get the Uid from the browser cookies.
*/
export function getUid(){
  return getCookie("uid");
}

/*
Get the email from the browser cookies.
*/
export function getEmail(){
  return getCookie("email") || "unknown.dev@student.kuleuven.be";
}

export function getName(){
    return getEmail().split("@")[0].replace('.', ' ');
}


function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      width: 40,
      height:40,
      bgcolor: stringToColor(name),
    },
    children: `${name.split(' ')[0][0] || name[0]}${name.split(' ')[1][0] || ""}` || "?",
  };
}

export function getAvatar(){
    return (<Avatar
        alt={getName()}
        {...stringAvatar(getName())}
    />);
}