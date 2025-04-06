export const SocialIcon = ({ href, platform, label, className }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`
        w-10 h-10 rounded-full flex items-center justify-center
        transition-all duration-300 transform hover:scale-110
        shadow-md hover:shadow-lg ${className}
      `}
    aria-label={`${label} del negocio`}
  >
    <span className="sr-only">{label}</span>
    {platform === "facebook" && (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
        />
      </svg>
    )}

    {platform === "instagram" && (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 19.4 19.4 22 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2M7.6 4C5.6 4 4 5.6 4 7.6V16.4C4 18.4 5.6 20 7.6 20H16.4C18.4 20 20 18.4 20 16.4V7.6C20 5.6 18.4 4 16.4 4H7.6M17.25 5.5C17.9 5.5 18.5 6.1 18.5 6.75C18.5 7.4 17.9 8 17.25 8C16.6 8 16 7.4 16 6.75C16 6.1 16.6 5.5 17.25 5.5M12 7C14.8 7 17 9.2 17 12C17 14.8 14.8 17 12 17C9.2 17 7 14.8 7 12C7 9.2 9.2 7 12 7M12 9C10.3 9 9 10.3 9 12C9 13.7 10.3 15 12 15C13.7 15 15 13.7 15 12C15 10.3 13.7 9 12 9Z"
        />
      </svg>
    )}

    {platform === "tiktok" && (
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"
        />
      </svg>
    )}
  </a>
);
