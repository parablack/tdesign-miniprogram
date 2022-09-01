import simulate from 'miniprogram-simulate';
import path from 'path';

describe('navbar', () => {
  const navbar = simulate.load(path.resolve(__dirname, `../navbar`), 't-navbar', {
    less: true,
    rootPath: path.resolve(__dirname, '../..'),
  });

  it(':base', async () => {
    const id = simulate.load({
      template: `<t-navbar visible="{{visible}}" animation="{{animation}}" title="test" />`,
      data: {
        visible: true,
        animation: true,
      },
      usingComponents: {
        't-navbar': navbar,
      },
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    expect(comp.toJSON()).toMatchSnapshot();

    // invisible
    comp.setData({ visible: false });
    await simulate.sleep();
    expect(comp.toJSON()).toMatchSnapshot();

    // without aniamtion
    comp.setData({ animation: false });
    await simulate.sleep();
    expect(comp.toJSON()).toMatchSnapshot();
  });

  it(':background', async () => {
    const id = simulate.load({
      template: `<t-navbar id="base" visible background="{{background}}" />`,
      data: {
        background: 'navy',
      },
      usingComponents: {
        't-navbar': navbar,
      },
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    const $content = comp.querySelector('#base >>> .t-navbar__content');
    expect($content.dom.style.background).toBe('navy');
  });

  it(':fixed', async () => {
    const id = simulate.load({
      template: `<t-navbar visible fixed title="test" />`,
      usingComponents: {
        't-navbar': navbar,
      },
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    await simulate.sleep();

    expect(comp.toJSON()).toMatchSnapshot();
  });

  it(':event', async () => {
    const handleBack = jest.fn();
    const handleHome = jest.fn();
    const handleSuccess = jest.fn();
    const handleFail = jest.fn();
    const handleComplete = jest.fn();
    const id = simulate.load({
      template: `<t-navbar 
        id="base" 
        visible 
        homeIcon="home" 
        leftIcon="chevron-left"
        bind:go-back="handleBack"
        bind:go-home="handleHome"
        bind:success="handleSuccess"
        bind:fail="handleFail"
        bind:complete="handleComplete"
         />`,
      methods: {
        handleBack,
        handleHome,
        handleSuccess,
        handleFail,
        handleComplete,
      },
      usingComponents: {
        't-navbar': navbar,
      },
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    const $base = comp.querySelector('#base');
    const $home = comp.querySelector('#base >>> .t-navbar__btn--home');
    const $back = comp.querySelector('#base >>> .t-navbar__btn--back');

    // go home
    $home.dispatchEvent('tap');
    await simulate.sleep();
    expect(handleHome).toHaveBeenCalled();

    // go back

    const mocked = jest.spyOn(wx, 'navigateBack');

    // mock success
    mocked.mockImplementation((option) => option.success());
    $back.dispatchEvent('tap');
    await simulate.sleep();
    expect(handleSuccess).toHaveBeenCalledTimes(1);
    expect(handleBack).toHaveBeenCalledTimes(1);

    // mock fail
    mocked.mockImplementation((option) => option.fail());
    $back.dispatchEvent('tap');
    await simulate.sleep();
    expect(handleFail).toHaveBeenCalledTimes(1);
    expect(handleBack).toHaveBeenCalledTimes(2);

    // mock complete
    mocked.mockImplementation((option) => option.complete());
    $back.dispatchEvent('tap');
    await simulate.sleep();
    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(handleBack).toHaveBeenCalledTimes(3);

    // mock delta < 1
    let hasBacked = false;
    $base.setData({ delta: 0 });
    mocked.mockImplementation(() => {
      hasBacked = true;
    });
    $back.dispatchEvent('tap');
    await simulate.sleep();
    expect(hasBacked).toBeFalsy();
  });

  it(':menu button', async () => {
    const id = simulate.load({
      template: `<t-navbar title="test" />`,
      usingComponents: {
        't-navbar': navbar,
      },
    });
    wx.getMenuButtonBoundingClientRect = () => ({
      top: 10,
      bottom: 20,
      left: 0,
      height: 10,
      width: 40,
    });
    const comp = simulate.render(id);
    comp.attach(document.createElement('parent-wrapper'));

    await simulate.sleep();

    expect(comp.toJSON()).toMatchSnapshot();
    wx.getMenuButtonBoundingClientRect = undefined;
  });
});
