import { useState, useContext } from "react";
import { Container, Group, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MantineLogo } from "@mantinex/mantine-logo";
import classes from "./Header.module.css";
import { NavbarLink } from "../buttons/NavbarLink";
import { AuthContext } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { IconLogin, IconLogout } from "@tabler/icons-react";

const links = [
  { link: "/about", label: "Features" },
  { link: "/pricing", label: "Pricing" },
  { link: "/learn", label: "Learn" },
  { link: "/community", label: "Community" },
];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);

  const auth = useContext(AuthContext);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      <Container size="full" className={classes.inner}>
        <Link
          to="/"
          style={{ color: "white" }}
        >
          <MantineLogo size={28} color="white" />
        </Link>
        <Group gap={5} visibleFrom="xs">
          {items}
          {!auth?.isAuthenticated ? (
            <Link to={`/auth`}>
              <NavbarLink icon={IconLogin} label="Login" />
            </Link>
          ) : (
            <NavbarLink
              onClick={auth.logout}
              icon={IconLogout}
              label="Logout"
            />
          )}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
