'use strict';

import { DebugProtocol } from 'vscode-debugprotocol';
import { LogConfiguration } from './log';

export interface CommonArguments {
    /** The debugger port to attach to. */
    debuggerPort: number;
    /** The IP address of the host where the application runs on. */
    host: string;
    /** Lets you configure diagnostic logging of the debug adapter. */
    log: LogConfiguration;
    /** Time in ms until we give up trying to connect. */
    timeout: number;
}

export interface AttachRequestArguments extends DebugProtocol.AttachRequestArguments,
    CommonArguments {
}

/**
 * Arguments needed for a launch request.
 *
 * These are the arguments needed when we want to launch a script on the server.
 */
export interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments,
    CommonArguments {
    /** The application port to attach to. */
    applicationPort: number;
    /** A username. The script is executed in the context of this user. */
    username: string;
    /** Your user's client affiliation if there is one. */
    principal?: string;
    /** The user's password. */
    password: string;
    /** The script that is executed on the server. */
    script: string;
    /** Automatically stop target after launching. If not specified, target does not stop. */
    stopOnEntry?: boolean;
}
