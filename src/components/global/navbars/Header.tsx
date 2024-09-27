import { useState, useContext } from "react";
import { Container, Group, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./Header.module.css";
import { NavbarLink } from "../buttons/NavbarLink";
import { AuthContext } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { IconLogin, IconLogout } from "@tabler/icons-react";

interface NavLink {
  link: string;
  label: string;
}
const publicLinks: NavLink[] = [{ link: "/", label: "Home" }];

const privateLinks: NavLink[] = [{ link: "/settings", label: "Settings" }];

export function HeaderSimple() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(publicLinks[0].link);

  const auth = useContext(AuthContext);

  const renderLink = (link: NavLink) => (
    <Link
      to={link.link}
      key={link.label}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={() => setActive(link.link)}
    >
      {link.label}
    </Link>
  );

  const publicItems = publicLinks.map(renderLink);
  const privateItems = auth?.user ? privateLinks.map(renderLink) : [];

  return (
    <header className={classes.header}>
      <Container size="full" className={classes.inner}>
        <Link to="/" className="no-underline text-inherit">
          <h3 className="text-lg no-underline">Gleamspeak</h3>
        </Link>
        <Group gap={5} visibleFrom="xs">
          {publicItems}
          {privateItems}
          {!auth?.user ? (
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
