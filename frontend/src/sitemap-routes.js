import React from 'react';
import { Route } from 'react-router-dom';


export default (
    <Route>
        <Route path="/" />
        <Route path="/register" />
        <Route path="/login" />
        <Route path="/profile" />
        <Route path="/settings" />
        <Route path="/create-room" />
        <Route path="/room/:roomToken" />
        <Route path="/join-room/:roomToken" />
        <Route path="/pricing" />
        <Route path="/checkout" />
        <Route path="/subscription" />
        <Route path="/reset-password" />
        <Route path="/reset-password/:token" />
        <Route path="/terms-of-use" />
        <Route path="/privacy" />
        <Route path="/contact" />
        <Route path="/unsubscribe/:email" />
        <Route path="/unsubscribe" />
        <Route path="/500" />
        <Route path="*" />
    </Route>
);