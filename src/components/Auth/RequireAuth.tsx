import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';

interface RequireAuthProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const token = localStorage.getItem('token');
        if (!token) {
          return <Redirect to="/login" />;
        }
        return <Component {...props} />;
      }}
    />
  );
};
