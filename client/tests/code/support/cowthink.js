import cowthink from 'code/core/support/cowthink';

describe('cowthink', function () {
  it('outputs a cow with an empty message', function () {
    expect(cowthink('')).to.equal(
` __
(  )
 --
        o   ^__^
         o  (oo)_______
            (__)       )/\\
                ||----w |
                ||     ||
`);
  });

  it('outputs a cow with a non-empty message', function () {
    expect(cowthink('Cows are cool')).to.equal(
` _______________
( Cows are cool )
 ---------------
        o   ^__^
         o  (oo)_______
            (__)       )/\\
                ||----w |
                ||     ||
`);
  });
});
