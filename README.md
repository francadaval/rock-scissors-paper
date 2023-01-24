# RockPaperScissors

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.1.1.

## Pending Improvements

* FE improvements:
** Improve FE erros handling
** Show FE notifications on events (for exaple, Material Snackbar).
** Improve UI design and behaviour (UX).
** Improve responsiveness.
** Reconnection to websocket.
** Input to set name of new rooms.
** Add information of present users in lists of rooms.

* BE improvements:
** Ends game once a player wins half plus one rounds.
** Add timestamp to WS messages.
** Add timestamp to game moves.
** Implement units tests.
** Implement integration tests
** Include actual DB.

## Instructions

* Run `npm install` to install project dependencies.
* Run `npm build` to build server and frontend applications.
* Run `npm start` to run server.
* Open `http:\\localhost:3000` on browser to run application.

## Aplication 

* Login in the application with any of the prepared users: user1/password, user2/password.
* Access to any of the game rooms listed in 'Your Rooms' tab or join to any room at 'Free Rooms' tab.
* Any player in the room can start a new game selecting number of rounds.
* In each game round click to select your move (rock, scissors or paper) and push 'Send Move' button.
* Once the opponent send its move yo can see the round result.
* Previous rounds results are listed under current movement.

## Known bugs

* None.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

