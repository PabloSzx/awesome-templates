import gql from "graphql-tag";
import Link from "next/link";
import { useQuery } from "react-apollo";

import { User } from "../src/server";

export default () => {
  const { loading, data } = useQuery<{ users: User[] }>(gql`
    query {
      users {
        email
        login
        name
        admin
      }
    }
  `);

  return (
    <div>
      <Link href="/">
        <button>Home</button>
      </Link>

      {!loading && data && (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(({ email, name, admin }, key) => (
              <tr key={key}>
                <td>{email}</td>
                <td>{name}</td>
                <td>{admin ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
