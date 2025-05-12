from playwright.sync_api import sync_playwright
import time

def damai_login():
    with sync_playwright() as p:
        ipad_user_agent = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        ipad_viewport = {"width": 1024, "height": 1366}
        browser = p.chromium.launch(headless=False)  # 显示浏览器界面
        context = browser.new_context(user_agent=ipad_user_agent, viewport=ipad_viewport, is_mobile=True, device_scale_factor=2.5)
        page = context.new_page()

        # 进入大麦网首页
        page.goto("https://www.damai.cn/")
        print("打开大麦首页...")

        # 点击“请先登录”
        page.click("text=请先登录")
        print("点击登录按钮...")

        # 滚动页面到扫码区域，提升扫码体验
        page.evaluate("window.scrollTo(0, 300)")

        # 等待用户扫码登录（你也可以选择账户登录，但涉及验证码）
        print("请在浏览器中扫码登录大麦账号...")
        # 等待页面跳转，直到检测到页面右上角出现“我的”按钮（登录成功标志）
        page.wait_for_selector("text=我的", timeout=0)
        print("检测到已登录，继续后续操作...")
        input("请确认已完成登录并按回车继续...")
        # 登录完成后打开目标演出页面（以某个演出为例）
        target_url = "https://m.damai.cn/shows/item.html?itemId=905207349063&sqm=&utm="
        page.goto(target_url)
        print("进入目标演出页面...")

        # 等待用户选择时间/票档手动提交
        print("请手动操作页面模拟抢票流程...")

        # 检查是否出现滑块验证码，若出现则自动拖动滑块
        try:
            slider = page.query_selector('div[class*="nc-container"] .nc_iconfont.btn_slide')
            if slider:
                print("检测到滑块验证码，尝试自动拖动...")
                box = slider.bounding_box()
                if box:
                    x_start = box["x"] + box["width"] / 2
                    y_start = box["y"] + box["height"] / 2
                    x_end = x_start + 220  # 滑块一般220-250px
                    success = False
                    for attempt in range(5):  # 最多尝试5次
                        print(f"第{attempt+1}次尝试滑动...")
                        page.mouse.move(x_start, y_start)
                        page.mouse.down()
                        # 模拟人类非匀速轨迹
                        total_steps = 35
                        import random
                        cur_x = x_start
                        for i in range(total_steps):
                            # 步长随机，带微小抖动
                            step = random.uniform(5, 10)
                            jitter = random.uniform(-1, 1)
                            next_x = cur_x + step
                            if next_x > x_end:
                                next_x = x_end
                            page.mouse.move(next_x, y_start + jitter)
                            cur_x = next_x
                            # 偶尔停顿
                            if i % 7 == 0:
                                time.sleep(random.uniform(0.03, 0.08))
                        # 更复杂的人类轨迹模拟
                        total_steps = 55
                        import random
                        cur_x = x_start
                        velocity = 0
                        acceleration = random.uniform(0.5, 1.2)
                        positions = []
                        # 加速阶段
                        for i in range(int(total_steps * 0.3)):
                            velocity += acceleration * random.uniform(0.8, 1.2)
                            step = velocity + random.uniform(1, 3)
                            jitter = random.uniform(-2, 2)
                            next_x = cur_x + step
                            if next_x > x_end:
                                next_x = x_end
                            positions.append((next_x, y_start + jitter))
                            cur_x = next_x
                        # 匀速阶段
                        for i in range(int(total_steps * 0.4)):
                            step = random.uniform(5, 8)
                            jitter = random.uniform(-2, 2)
                            next_x = cur_x + step
                            if next_x > x_end:
                                next_x = x_end
                            positions.append((next_x, y_start + jitter))
                            cur_x = next_x
                        # 减速+回拉阶段
                        for i in range(int(total_steps * 0.2)):
                            step = random.uniform(2, 5)
                            jitter = random.uniform(-3, 3)
                            next_x = cur_x + step
                            if i == int(total_steps * 0.2) - 2:
                                # 模拟回拉
                                next_x -= random.uniform(8, 18)
                            if next_x > x_end:
                                next_x = x_end
                            positions.append((next_x, y_start + jitter))
                            cur_x = next_x
                        # 微调+抖动阶段
                        for i in range(int(total_steps * 0.1)):
                            step = random.uniform(1, 3)
                            jitter = random.uniform(-4, 4)
                            next_x = cur_x + step
                            if next_x > x_end:
                                next_x = x_end
                            positions.append((next_x, y_start + jitter))
                            cur_x = next_x
                        # 执行轨迹
                        for idx, (nx, ny) in enumerate(positions):
                            page.mouse.move(nx, ny)
                            if idx % 6 == 0:
                                time.sleep(random.uniform(0.03, 0.09))
                            if idx % 13 == 0:
                                # 偶尔停顿更久
                                time.sleep(random.uniform(0.12, 0.22))
                        # 最后微调到终点
                        page.mouse.move(x_end, y_start + random.uniform(-2, 2))
                        page.mouse.up()
                        print("滑块拖动完成，等待验证...")
                        time.sleep(2)
                        # 检查滑块是否消失（通过class变化或元素消失）
                        slider_new = page.query_selector('div[class*="nc-container"] .nc_iconfont.btn_slide')
                        if not slider_new:
                            print("滑块验证通过！")
                            success = True
                            break
                        else:
                            print("滑块验证未通过，刷新页面重试...")
                            page.reload()
                            time.sleep(random.uniform(2, 3))
                            print("滑块验证未通过，重试...")
                            time.sleep(random.uniform(1, 2))
                    if not success:
                        print("多次尝试后滑块仍未通过，请手动处理或刷新页面重试。")
        except Exception as e:
            print(f"滑块拖动异常: {e}")
        time.sleep(60)  # 保持页面打开1分钟以供观察
        browser.close()

if __name__ == "__main__":
    damai_login()
