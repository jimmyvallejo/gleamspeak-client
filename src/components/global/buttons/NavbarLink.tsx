import { Tooltip, UnstyledButton } from "@mantine/core";
import classes from "../navbars/Channel.module.css";
import { IconHome2 } from "@tabler/icons-react";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  active?: boolean;
  onClick?(): void;
}

export function NavbarLink({
  icon: Icon,
  label,
  active,
  onClick,
}: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
      >
        <Icon className="w-5 h-5" stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}
