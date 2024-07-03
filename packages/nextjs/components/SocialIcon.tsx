// components/DynamicIcon.js
import dynamic from "next/dynamic";

const SocialIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const IconComponent = dynamic(() => import(`../public/providers/${iconName}.svg`));

  return <IconComponent className={className} />;
};

export default SocialIcon;
