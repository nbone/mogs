# Multiplayer Online Game Server

## Work in progress :warning:

This is still very much in the explore / prototype phase. It's far from fully functional. I'm figuring it out and evolving the design as I go. If you're brave enough to look at the code, expect to find sloppy organisation, partially fleshed-out ideas, and poor style. Polish will come after I get it working.

## What is this, anyway?

MOGS *will be* a simple web app where friends can chat and play games. The deployed app will eventually be linked from this repo.

## Why?

Purely for my own education and enjoyment. I decided to make this on a whim, while learning React, because I learn best when I have a project to apply it to. This is not meant to be fancy or full-featured, nor to compete with existing game servers.

## Architecture

At the package level we have the react `app` that runs in the browser, the nodejs `server` backend, and some `common` code. Almost everything underneath is due to be rewritten once I have it fully working.
