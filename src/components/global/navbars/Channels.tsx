import { useContext } from "react";
import {
  Center,
  Tooltip,
  UnstyledButton,
  Stack,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconHome2,
  IconGauge,
  IconDeviceDesktopAnalytics,
  IconFingerprint,
  IconCalendarStats,
  IconUser,
  IconSettings,
  IconLogin,
  IconSwitchHorizontal,
  IconLogout,
  IconPlus,
} from "@tabler/icons-react";
import { MantineLogo } from "@mantinex/mantine-logo";
import classes from "./Channel.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import { CreateServerModal } from "../modals/CreateServerModal";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  link: string;
  onClick?(): void;
}

function NavbarLink({ icon: Icon, label, link, onClick }: NavbarLinkProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === link;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(link);
    }
  };

  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        onClick={handleClick}
        className={classes.link}
        data-active={isActive || undefined}
      >
        <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
  { icon: IconHome2, label: "Home", link: "/" },
  { icon: IconGauge, label: "Servers", link: "/servers" },
  { icon: IconDeviceDesktopAnalytics, label: "Analytics", link: "/analytics" },
  { icon: IconCalendarStats, label: "Releases", link: "/releases" },
  { icon: IconUser, label: "Account", link: "/account" },
  { icon: IconFingerprint, label: "Security", link: "/security" },
  { icon: IconSettings, label: "Settings", link: "/settings" },
];

export function Channels() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [opened, { open, close }] = useDisclosure(false);

  const links = mockdata.map((link) => (
    <NavbarLink {...link} key={link.label} />
  ));

  return (
    <>
      <nav className={classes.navbar}>
        <Center>
          <MantineLogo type="mark" size={0} />
        </Center>

        <div className={classes.navbarMain}>
          <div className="mb-4">
            <NavbarLink
              icon={IconPlus}
              label="Create Server"
              link=""
              onClick={open}
            />
          </div>
          <Stack justify="center" gap={0}>
            {links}
          </Stack>
        </div>

        <Stack justify="center" gap={0}>
          <NavbarLink
            icon={IconSwitchHorizontal}
            label="Change account"
            link="/change-account"
          />
          {!auth?.isAuthenticated ? (
            <NavbarLink icon={IconLogin} label="Sign Up/Login" link="/auth" />
          ) : (
            <NavbarLink
              onClick={() => {
                auth.logout();
                navigate("/");
              }}
              icon={IconLogout}
              label="Logout"
              link="/"
            />
          )}
        </Stack>
      </nav>
      <CreateServerModal opened={opened} onClose={close} />
    </>
  );
}
