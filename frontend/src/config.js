const BASE_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : 'http://localhost:5000/api'
const DEFAULT_AVATAR = `${process.env.REACT_APP_WEB_BASE_URL}/default-avatar.png`;

export { BASE_URL, DEFAULT_AVATAR };